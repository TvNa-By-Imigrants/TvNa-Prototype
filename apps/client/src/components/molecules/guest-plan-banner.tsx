import { Link } from "@tanstack/react-router"
import { SparklesIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/i18n"
import { usePermissions } from "@/lib/permissions"

export function GuestPlanBanner() {
  const { t } = useLanguage()
  const { user, isLoading } = usePermissions()

  if (isLoading || user) return null

  return (
    <Card className="border-primary-border bg-primary-tint pt-0">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-card/70 text-primary">
            <SparklesIcon className="size-4" aria-hidden="true" />
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-foreground">
              {t("guest.bannerTitle")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("guest.bannerText")}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link to="/sign-in">
            <Button variant="outline" size="sm">
              {t("guest.signIn")}
            </Button>
          </Link>
          <Link to="/sign-in">
            <Button size="sm">{t("guest.signUp")}</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
