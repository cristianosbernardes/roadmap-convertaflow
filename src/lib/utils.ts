import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Helper canônico do shadcn — merge condicional de classes Tailwind.
 * Reusado em todos os componentes UI. Idêntico ao do app principal.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
