import { Link } from "@tanstack/react-router"
import { MapPinIcon } from "lucide-react"

import { useLanguage } from "@/i18n"
import { cn } from "@/lib/utils"

/**
 * Brand lockup: pin mark + "TvNa" wordmark, wrapped in a TanStack Link.
 */
export function Logo({ className }: { className?: string }) {
  const { t } = useLanguage()

  return (
    <Link
      to="/"
      aria-label={t("header.homeAria")}
      className={cn("flex items-center gap-2.5 rounded-lg focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary", className)}
    >
      <LogoMark className="size-9" />
      <span className="text-lg leading-none font-semibold tracking-tight text-foreground">
        TvNa
      </span>
    </Link>
  )
}

/** Icon-only lockup, used where a full wordmark does not fit. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground",
        className
      )}
    >
      <MapPinIcon className="size-5" />
    </span>
  )
}
