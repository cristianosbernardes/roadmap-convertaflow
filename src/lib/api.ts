/**
 * Cliente HTTP Axios para a API ConvertaFlow.
 *
 * Aponta para `api.convertaflow.com/api/v1/roadmap/*` (módulo Python
 * adicionado ao backend-python do app principal — ainda a implementar).
 *
 * Auth: injeta o JWT do Clerk via interceptor quando user autenticado.
 * Endpoints públicos (listagem) funcionam sem auth.
 */
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.convertaflow.com";

/**
 * Erro padronizado da API.
 * Backend Python retorna sempre { detail: string } em 4xx.
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public reason?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Cria instância Axios. Recebe getToken async pra plugar com Clerk.
 *
 * Uso em Server Components:
 *   const { getToken } = await auth();
 *   const api = createApiClient(() => getToken());
 *
 * Uso em Client Components:
 *   const { getToken } = useAuth();
 *   const api = createApiClient(getToken);
 */
export function createApiClient(
  getToken?: () => Promise<string | null>
): AxiosInstance {
  const instance = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
    timeout: 15000,
    headers: { "Content-Type": "application/json" },
  });

  // Injeta JWT se disponível (endpoints públicos não exigem)
  instance.interceptors.request.use(async (config) => {
    if (getToken) {
      try {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        // OK: se não conseguir obter token, segue sem (endpoint pode ser público)
        // Pior caso: endpoint protegido retorna 401, frontend trata.
        console.debug("[api] getToken falhou — seguindo sem auth", e);
      }
    }
    return config;
  });

  // Padroniza erros
  instance.interceptors.response.use(
    (res) => res,
    (error: AxiosError<{ detail?: string; reason?: string }>) => {
      const status = error.response?.status ?? 0;
      const detail =
        error.response?.data?.detail ||
        error.message ||
        "Erro desconhecido na API";
      throw new ApiError(
        status,
        detail,
        error.response?.data?.reason,
        error.response?.data
      );
    }
  );

  return instance;
}

/**
 * Cliente público (sem auth) — pra uso em SSR de páginas públicas.
 */
export const publicApi = createApiClient();
