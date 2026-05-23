import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, onFocus, onBlur, style, ...props }: React.ComponentProps<"input"> & { "data-context"?: "neutral" | "destructive" | "admin" | "success" }) {
  const context = (props as { "data-context"?: string })["data-context"] ?? "neutral"
  const focusColor =
    context === "destructive" ? "#dc2626" :
    context === "admin"       ? "#991b1b" :
    context === "success"     ? "#16a34a" :
                                "#1e7fd4"

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full px-3 py-2.5 text-[14px] rounded-[10px] outline-none transition-all placeholder:text-muted-foreground file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
        className
      )}
      style={{
        background: "var(--surface-card)",
        border: "1.5px solid var(--border-primary)",
        color: "var(--text-primary)",
        ...style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = focusColor
        e.currentTarget.style.boxShadow = `0 0 0 3px ${focusColor}15`
        onFocus?.(e)
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "var(--border-primary)"
        e.currentTarget.style.boxShadow = "none"
        onBlur?.(e)
      }}
      {...props}
    />
  )
}

export { Input }