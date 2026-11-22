import type { ReactNode } from "react"
import { ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export type SectionHeaderProps = {
  title: string
  subtitle?: string
  viewAll?: string
  icon?: ReactNode
  onViewAll?: () => void
}

export function SectionHeader({
  title,
  subtitle,
  viewAll,
  icon,
  onViewAll,
}: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-2">
      <div className="flex flex-col gap-0.5">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
          {icon}
          {title}
        </h2>
        {subtitle ? (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>

      {viewAll ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewAll}
          className="cursor-pointer font-medium"
        >
          <span>{viewAll}</span>
          <ChevronRightIcon data-icon="inline-end" />
        </Button>
      ) : null}
    </div>
  )
}
