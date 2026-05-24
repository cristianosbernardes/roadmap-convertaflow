import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MarkdownRenderer } from "@/components/markdown-renderer";

export const metadata: Metadata = {
  title: "Sobre este roadmap",
  description:
    "Política do roadmap público da ConvertaFlow — como decidimos o que construir, por que não há datas, como participar e como reagimos a sugestões pausadas ou recusadas.",
};

/**
 * /sobre — política pública do roadmap.
 *
 * Gate de lançamento v1.0 (ADR-013).
 * Conteúdo segue [[Voz e Tom]] no Obsidian §"Página /sobre".
 *
 * Estrutura:
 *   1. O que é este roadmap
 *   2. Como decidimos o que construir
 *   3. Por que não há datas
 *   4. Como participar (anônimo + cadastrado + assinante)
 *   5. Tempo de resposta esperado
 *   6. Quando uma sugestão é pausada ou recusada
 *   7. Voto positivo, não negativo (filosofia)
 *   8. Privacidade (LGPD)
 *   9. Links úteis
 */
export default function SobrePage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#faf8ff" }}
    >
      <Header />

      <main className="flex-1 mx-auto w-full max-w-3xl px-6 py-10">
        {/* Hero */}
        <section className="mb-10">
          <div className="inline-block">
            <h1
              className="text-[40px] font-extrabold leading-[1.05] pb-2"
              style={{
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              Sobre este roadmap
            </h1>
            <div
              className="h-[2px] rounded-full"
              style={{
                width: "80px",
                background:
                  "linear-gradient(90deg, var(--brand-primary) 0%, var(--brand-cta) 100%)",
              }}
            />
          </div>
          <p
            className="text-[17px] mt-4 leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            Transparência sobre como decidimos o que construir, por que não
            mostramos datas e como você pode participar.
          </p>
        </section>

        {/* Conteúdo */}
        <article
          className="rounded-[10px] p-8"
          style={{
            background: "var(--surface-card)",
            border: "1.5px solid var(--border-primary)",
          }}
        >
          <MarkdownRenderer content={SOBRE_CONTENT} variant="default" />

          {/* Links úteis no fim */}
          <div
            className="mt-10 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3"
            style={{
              borderTop: "1px solid var(--border-secondary)",
            }}
          >
            <Link
              href="https://convertaflow.com/docs"
              target="_blank"
              rel="noopener"
              className="text-center rounded-[10px] p-3 transition-colors hover:bg-[var(--surface-low)]"
              style={{
                background: "var(--surface-low)",
                border: "1px solid var(--border-secondary)",
                color: "var(--text-primary)",
              }}
            >
              <div className="text-[13px] font-semibold">Central de Ajuda</div>
              <div
                className="text-[11px] mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                Tutoriais e dúvidas
              </div>
            </Link>
            <Link
              href="https://app.convertaflow.com"
              target="_blank"
              rel="noopener"
              className="text-center rounded-[10px] p-3 transition-colors hover:bg-[var(--surface-low)]"
              style={{
                background: "var(--surface-low)",
                border: "1px solid var(--border-secondary)",
                color: "var(--text-primary)",
              }}
            >
              <div className="text-[13px] font-semibold">App ConvertaFlow</div>
              <div
                className="text-[11px] mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                Entrar na plataforma
              </div>
            </Link>
            <Link
              href="https://convertaflow.com#pricing"
              target="_blank"
              rel="noopener"
              className="text-center rounded-[10px] p-3 transition-colors hover:bg-[var(--surface-low)]"
              style={{
                background: "var(--surface-low)",
                border: "1px solid var(--border-secondary)",
                color: "var(--text-primary)",
              }}
            >
              <div className="text-[13px] font-semibold">Conhecer planos</div>
              <div
                className="text-[11px] mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                Virar assinante
              </div>
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}

const SOBRE_CONTENT = `## O que é este roadmap

Este é o roadmap público da **ConvertaFlow** — plataforma omnichannel + IA para atendimento e conversão via WhatsApp, Instagram e Facebook.

Aqui você acompanha tudo o que estamos construindo: o que está **em análise**, **planejado**, **em desenvolvimento**, **em beta privado** e **concluído**. Sem promessas vazias, sem datas vagas — só o estado real do trabalho.

## Como decidimos o que construir

Olhamos pra 3 sinais combinados antes de mexer em qualquer feature:

1. **Quantas pessoas votaram** — sinal de demanda geral
2. **Quantas empresas pagantes marcaram "Minha empresa precisa"** — sinal B2B ponderado (peso bem maior do que voto comum)
3. **Viabilidade técnica + alinhamento estratégico** — o time avalia se faz sentido com a direção da plataforma

Não é só popularidade. Uma feature votada por 500 visitantes mas zero clientes pagantes pode perder pra outra com 50 votos e 10 empresas precisando.

## Por que não há datas

Datas em roadmap público viram **prisão**:

- Cliente vê "Q3 2026" e cobra no dia 1 de outubro
- Atraso (que acontece em 80% dos casos) vira problema de comunicação
- A gente acaba escolhendo features fáceis pra "bater data" em vez das importantes

Em vez disso, mostramos **status**:

- 🔍 **Sob análise** — estamos avaliando
- 📋 **Planejado** — decidimos fazer
- 🚧 **Em desenvolvimento** — trabalho ativo agora
- 🧪 **Beta privado** — em teste com grupo restrito
- ✅ **Concluído** — em produção
- ⏸️ **Pausado** — suspenso (sempre com motivo público)
- ❌ **Não será feito** — decidimos não construir (sempre com motivo público)

Quando algo avança, atualizamos. Quando algo pausa, explicamos. Sem datas falsas.

## Como participar

Cada nível faz mais coisas:

### 👤 Visitante (sem cadastro)
- **Lê** todas as features e comentários
- **Vota** anonimamente nas features que importam (até 20 votos por dia por dispositivo)
- **Recebe email** quando algo importante mudar (opt-in opcional, não vira conta)

### 🔐 Cadastrado (conta gratuita)
- Tudo do visitante +
- **Comenta** em qualquer feature (mínimo 15 caracteres pra evitar "+1")
- **Sugere** novas features (entra em moderação)
- **Reage** a comentários (👍 ❤️ 🎉)
- Vê o que você votou em "Minhas sugestões"

### ⭐ Assinante ativo (cliente pagante)
- Tudo do cadastrado +
- **Marca "Minha empresa precisa"** — sinal B2B com peso maior na priorização
- **Reporta bug** com fluxo dedicado de suporte
- **Solicita acesso beta** em features marcadas como "Beta privado"

### 👔 Equipe ConvertaFlow (staff)
- Modera, responde oficialmente, altera status de features

## Tempo de resposta esperado

- **Comentário do cliente:** respondemos em até 48h úteis (geralmente menos)
- **Sugestão nova:** moderada em até 48h. Quando aprovada, vira pública
- **Bug crítico (assinante):** triagem em 4h úteis
- **Solicitação de acesso beta:** revisada em até 7 dias

## Quando uma sugestão é pausada ou recusada

Toda transição pra "Pausado" ou "Não será feito" **exige motivo público obrigatório** (não pode ser silencioso). Você vê:

- O que aconteceu (texto explicativo)
- Quando (timestamp)
- Quem da equipe revisou

Exemplos de motivos válidos:
- *"Pausado: aguardando atualização da API da Meta que afeta como vamos implementar"*
- *"Não será feito: já coberto pela feature X. Detalhes em [link]"*
- *"Não será feito: fora do escopo da plataforma (não somos um CRM completo)"*

## Voto positivo, não negativo

Você notou que só tem botão "votar" — não tem "desvotar" ou "votar contra". Foi decisão consciente:

- **Voto negativo gera ataque coordenado.** Concorrente pode pagar pessoas pra "afundar" features que ele copiou
- **Não traz informação útil.** "Não quero essa feature" geralmente significa só "isso não me afeta", não "isso é ruim"
- **Discordância qualitativa é mais valiosa.** Se você discorda de uma sugestão, **comente explicando o porquê**. Vale 1000x mais que um voto negativo

Se uma feature não te interessa, simplesmente não vote. Se você discorda fortemente, escreva nos comentários.

## Privacidade (LGPD)

- **Voto anônimo** não cria conta nem expõe identidade
- **Comentário e sugestão** mostram seu nome + avatar (Clerk SSO)
- Você pode **excluir sua conta** a qualquer momento (todos os comentários e sugestões viram "Usuário removido")
- Não vendemos seus dados, não usamos pra ads, não compartilhamos com terceiros
- Detalhes legais completos: [Política de Privacidade](https://convertaflow.com/privacy-policy)

## Encontrou algo errado neste roadmap?

Comente na própria feature. Se for algo mais sério (informação errada sobre status, motivo público errado, etc), nos avise pelo email **contato@convertaflow.com**.

---

*Última atualização desta política: 24 de maio de 2026.*`;
