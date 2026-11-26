import { useMemo, useState } from "react"
import { Share2Icon } from "lucide-react"

import { CopyButton, PermissionIndicator } from "@/components/atom/common"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/i18n"
import type { PlanStopItem } from "@/lib/plan-context"
import { createShareUrl } from "@/lib/share-plan"

export type SharePlanModalProps = {
  stops: PlanStopItem[]
}

export function SharePlanModal({ stops }: SharePlanModalProps) {
  const { language, t } = useLanguage()
  const [open, setOpen] = useState(false)

  const share = useMemo(() => {
    if (stops.length === 0) return { url: "", error: null }
    try {
      return { url: createShareUrl(stops), error: null }
    } catch {
      return { url: "", error: t("share.errorTooLong") }
    }
  }, [stops, t])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="outline" className="gap-2" disabled={stops.length === 0} />}
      >
        <Share2Icon className="size-4" aria-hidden="true" />
        {t("placeDetail.share")}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("share.title")}</DialogTitle>
          <DialogDescription>{t("share.description")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <PermissionIndicator label={t("share.viewOnly")} />
            <span className="text-sm text-muted-foreground">
              {t("share.permission")}
            </span>
          </div>

          <label htmlFor="share-link" className="text-sm font-medium text-foreground">
            {t("share.linkLabel")}
          </label>
          <div className="flex gap-2">
            <Input
              id="share-link"
              readOnly
              value={share.url}
              onFocus={(event) => event.target.select()}
              aria-label={t("share.linkLabel")}
              className="min-w-0 flex-1 text-sm"
            />
            <CopyButton
              textToCopy={share.url}
              copyLabel={t("share.copy")}
              copiedLabel={t("share.copied")}
              showText
              language={language}
              disabled={!share.url}
            />
          </div>
          {share.error ? (
            <p role="alert" className="text-sm text-destructive">
              {share.error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            {t("placeDetail.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
