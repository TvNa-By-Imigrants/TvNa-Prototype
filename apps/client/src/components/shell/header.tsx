import { useNavigate } from "@tanstack/react-router"
import {
  GlobeIcon,
  LogOutIcon,
  MoonIcon,
  PencilIcon,
  SearchIcon,
  SunIcon,
  UserRoundIcon,
  XIcon,
} from "lucide-react"
import { useState, type RefObject } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import type { AuthMode } from "@/components/organisms/auth/auth-dialog"
import { languages, useLanguage, type Language } from "@/i18n"
import { usePermissions } from "@/lib/permissions"
import { useProfileContext } from "@/lib/profile-context"
import { cn } from "@/lib/utils"

import { Logo } from "./logo"
import { NavLinks, type NavProps } from "./nav"

/** Search bar built strictly from shadcn InputGroup primitives. */
function SearchBar({ className }: { className?: string }) {
  const [query, setQuery] = useState("")
  const { t } = useLanguage()

  return (
    <InputGroup className={cn("h-10", className)}>
      <InputGroupAddon align="inline-start">
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("header.search")}
        aria-label={t("header.searchAria")}
      />
      {query ? (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label={t("header.clearSearch")}
            onClick={() => setQuery("")}
          >
            <XIcon />
          </InputGroupButton>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  )
}

function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            aria-label={t("header.changeLanguage")}
          />
        }
      >
        <GlobeIcon data-icon="inline-start" />
        <span>{language.toUpperCase()}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("header.language")}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={language}
            onValueChange={(value) => {
              if (value === "km" || value === "en") {
                setLanguage(value as Language)
              }
            }}
          >
            {languages.map((item) => (
              <DropdownMenuRadioItem
                key={item.value}
                value={item.value}
                closeOnClick
              >
                {item.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ThemeToggle() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  )
  const { t } = useLanguage()

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle("dark", next)
    try {
      localStorage.setItem("theme", next ? "dark" : "light")
    } catch {
      // localStorage unavailable (private mode)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={t("header.toggleTheme")}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
      <span className="sr-only">{t("header.toggleTheme")}</span>
    </Button>
  )
}

function AuthButtons({
  size = "lg",
  onAuthAction,
  onSignOut,
  onEditProfile,
}: {
  size?: "sm" | "lg"
  onAuthAction: (mode: AuthMode) => void
  onSignOut: () => void
  onEditProfile: () => void
}) {
  const { t } = useLanguage()
  const { user } = usePermissions()
  const { getOwnerProfile } = useProfileContext()
  const navigate = useNavigate()

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size={size} className="max-w-40" />
          }
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <UserRoundIcon className="size-4" />
          </span>
          <span className="truncate">{user.name || user.email}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="truncate">
              {user.name || user.email}
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                navigate({
                  to: "/profile",
                  search: { handle: getOwnerProfile()?.handle ?? "" },
                })
              }
            >
              <UserRoundIcon data-icon="inline-start" />
              {t("profile.myProfile")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEditProfile}>
              <PencilIcon data-icon="inline-start" />
              {t("profile.editProfile")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSignOut}>
              <LogOutIcon data-icon="inline-start" />
              {t("auth.signOut")}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button variant="ghost" size={size} onClick={() => onAuthAction("login")}>
        {t("header.login")}
      </Button>
      <Button size={size} onClick={() => onAuthAction("register")}>
        {t("header.register")}
      </Button>
    </div>
  )
}

export type HeaderProps = NavProps & {
  onAuthAction: (mode: AuthMode) => void
  onSignOut: () => void
  onEditProfile: () => void
  /** AppShell measures this element to publish --header-h for sticky tabs. */
  headerRef?: RefObject<HTMLElement | null>
}

/**
 * Sticky app chrome. Mobile: two rows (brand + auth/lang, then search + theme).
 * Desktop (`lg`): a single row with the primary nav promoted into the header.
 */
export function Header({
  className,
  onAuthAction,
  onSignOut,
  onEditProfile,
  headerRef,
}: HeaderProps) {
  return (
    <header
      ref={headerRef}
      className={cn("sticky top-0 z-40 border-b border-border bg-card", className)}
    >
      {/* Desktop */}
      <div className="mx-auto hidden h-16 w-full max-w-7xl items-center justify-between gap-6 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] lg:flex">
        <div className="flex items-center gap-8">
          <Logo />
          <NavLinks />
        </div>
        <div className="flex items-center gap-2">
          <SearchBar className="w-64" />
          <ThemeToggle />
          <LanguageSwitcher />
          <AuthButtons
            onAuthAction={onAuthAction}
            onSignOut={onSignOut}
            onEditProfile={onEditProfile}
          />
        </div>
      </div>

      {/* Mobile */}
      <div className="mx-auto w-full max-w-7xl py-3 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] lg:hidden">
        <div className="flex items-center justify-between gap-2">
          <Logo />
          <div className="flex items-center gap-1">
            <AuthButtons
              size="sm"
              onAuthAction={onAuthAction}
              onSignOut={onSignOut}
              onEditProfile={onEditProfile}
            />
            <LanguageSwitcher />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <SearchBar />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
