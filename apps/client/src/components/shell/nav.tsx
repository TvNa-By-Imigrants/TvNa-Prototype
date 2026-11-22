import { Link } from "@tanstack/react-router"
import {
  CalendarDaysIcon,
  HouseIcon,
  MapIcon,
  MapPinIcon,
  RssIcon,
  type LucideIcon,
} from "lucide-react"

import { useLanguage, type TranslationKey } from "@/i18n"
import { cn } from "@/lib/utils"

export type NavItem = {
  labelKey: TranslationKey
  href: string
  icon: LucideIcon
}

/**
 * The five primary destinations: Home, Place, Plan, Map, Feed.
 */
export const navItems: NavItem[] = [
  { labelKey: "nav.home", href: "/", icon: HouseIcon },
  { labelKey: "nav.place", href: "/place", icon: MapPinIcon },
  { labelKey: "nav.plan", href: "/plan", icon: CalendarDaysIcon },
  { labelKey: "nav.map", href: "/map", icon: MapIcon },
  { labelKey: "nav.feed", href: "/feed", icon: RssIcon },
]

export type NavProps = {
  className?: string
}

/**
 * Desktop top navigation (promoted from the mobile bottom bar).
 * Uses TanStack Router `<Link>` with activeProps for reliable active styling.
 */
export function NavLinks({ className }: NavProps) {
  const { t } = useLanguage()

  return (
    <nav aria-label="Primary" className={cn("flex items-center gap-1", className)}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          activeOptions={{ exact: item.href === "/" }}
          activeProps={{
            className: "border-primary text-primary font-semibold",
          }}
          inactiveProps={{
            className: "border-transparent text-muted-foreground hover:text-foreground",
          }}
          className="border-b-2 px-3 py-2 text-sm font-medium transition-colors"
        >
          {t(item.labelKey)}
        </Link>
      ))}
    </nav>
  )
}

/**
 * Mobile bottom navigation bar (fixed; hidden from `lg` up).
 * Note: Design.md requires a 14px (`text-sm`) minimum for Khmer text;
 * English can use 12px (`text-xs`).
 */
export function BottomNav({ className }: NavProps) {
  const { language, t } = useLanguage()

  return (
    <nav
      aria-label="Mobile"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card lg:hidden",
        className
      )}
    >
      <div className="grid grid-cols-5 px-2 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              to={item.href}
              activeOptions={{ exact: item.href === "/" }}
              activeProps={{
                className: "text-primary font-semibold",
              }}
              inactiveProps={{
                className: "text-muted-foreground hover:text-foreground",
              }}
              className={cn(
                "group flex flex-col items-center gap-1 py-2 font-medium transition-colors",
                language === "km" ? "text-sm" : "text-xs"
              )}
            >
              <Icon className="size-5 transition-colors group-[.active]:text-primary" />
              <span className="truncate">{t(item.labelKey)}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
