import { EyeIcon } from "lucide-react"
import { cn } from "cn"

export type PermissionIndicatorProps = {
  label: string
  className?: string
}

export function PermissionIndicator({
  label,
  className,
}: PermissionIndicatorProps) {
  return (
    <span
      data-slot="permission-indicator"
      className={cn(
        "inline-flex select-none items-center gap-1.5 rounded-full border border-primary-border bg-primary-tint px-2.5 py-1 text-sm font-medium text-primary-strong",
        className,
      )}
    >
      <EyeIcon className="size-3.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  )
}
