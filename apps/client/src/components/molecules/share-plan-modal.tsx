import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
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
import { createShareUrl } from "@/lib/share-plan"
import { sharePlan } from "@/lib/plans-api"

export type SharePlanModalProps = {
  planId: string | null
  disabled?: boolean
}

export function SharePlanModal({ planId, disabled = false }: SharePlanModalProps) {
  const { language, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [shareLink, setShareLink] = useState<{
    planId: string
    url: string
  } | null>(null)
  const shareMutation = useMutation({
    mutationFn: sharePlan,
    onSuccess: ({ token }, planId) =>
      setShareLink({ planId, url: createShareUrl(token) }),
  })
  const shareUrl = shareLink?.planId === planId ? shareLink.url : ""

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (nextOpen && planId && shareLink?.planId !== planId) {
      if (!shareMutation.isPending) shareMutation.mutate(planId)
    } else if (nextOpen && !planId) {
      shareMutation.reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={<Button variant="outline" className="gap-2" disabled={disabled} />}
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
              value={shareUrl}
              onFocus={(event) => event.target.select()}
              aria-label={t("share.linkLabel")}
              className="min-w-0 flex-1 text-sm"
            />
            <CopyButton
              textToCopy={shareUrl}
              copyLabel={t("share.copy")}
              copiedLabel={t("share.copied")}
              showText
              language={language}
              disabled={!shareUrl}
            />
          </div>
          {!planId ? (
            <p className="text-sm text-muted-foreground">{t("share.saveFirst")}</p>
          ) : shareMutation.isPending ? (
            <p role="status" className="text-sm text-muted-foreground">
              {t("share.generating")}
            </p>
          ) : shareMutation.isError ? (
            <p role="alert" className="text-sm text-destructive">
              {t("share.errorGenerating")}
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
