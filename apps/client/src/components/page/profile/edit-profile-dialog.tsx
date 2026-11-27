import { useEffect, useRef, useState, type FormEvent } from "react"
import { useNavigate } from "@tanstack/react-router"
import { ImageIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Textarea } from "@/components/ui/textarea"
import type { Profile } from "@/data/profiles"
import { normalizeHandle } from "@/data/profiles"
import { useLanguage } from "@/i18n"
import { useProfileContext } from "@/lib/profile-context"
import { cn } from "@/lib/utils"

const BIO_LIMIT = 160
const HANDLE_PATTERN = /^[a-z0-9_]{3,20}$/
const inputClass = "h-11 rounded-lg px-3 text-base md:text-sm"

type Values = {
  name: string
  handle: string
  bio: string
  location: string
  avatar?: string
}
type Errors = Partial<Record<keyof Values, string>>

export type EditProfileDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: Profile
}

/** Same responsive sheet/dialog treatment as the auth forms. */
export function EditProfileDialog({
  open,
  onOpenChange,
  profile,
}: EditProfileDialogProps) {
  const { language, t } = useLanguage()
  const { updateProfile, handleTaken } = useProfileContext()
  const navigate = useNavigate()
  const [values, setValues] = useState<Values>({
    name: profile.name,
    handle: profile.handle,
    bio: language === "km" ? profile.bioKm : profile.bio,
    location: language === "km" ? profile.locationKm : profile.location,
    avatar: profile.avatar,
  })
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Seed from the profile every time it opens, so Cancel leaves nothing behind.
  useEffect(() => {
    if (!open) return
    setValues({
      name: profile.name,
      handle: profile.handle,
      bio: language === "km" ? profile.bioKm : profile.bio,
      location: language === "km" ? profile.locationKm : profile.location,
      avatar: profile.avatar,
    })
    setErrors({})
  }, [open, profile, language])

  const setValue = (key: keyof Values, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  // No upload endpoint yet: the picked file is previewed locally and its blob
  // URL is stored with the prototype profile until a real API replaces it.
  const pickPhoto = (file: File | undefined) => {
    if (!file) return
    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      toast.error(t("profile.photoInvalid"))
      return
    }
    setValues((prev) => ({ ...prev, avatar: URL.createObjectURL(file) }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const name = values.name.trim()
    const handle = normalizeHandle(values.handle)
    const nextErrors: Errors = {}
    if (!name) nextErrors.name = t("profile.errNameRequired")
    if (!HANDLE_PATTERN.test(handle)) {
      nextErrors.handle = t("profile.errHandleFormat")
    } else if (handleTaken(handle, profile.handle)) {
      nextErrors.handle = t("profile.errHandleTaken")
    }
    if (values.bio.length > BIO_LIMIT) nextErrors.bio = t("profile.errBioLong")
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 500))

    const bioKey = language === "km" ? "bioKm" : "bio"
    const locationKey = language === "km" ? "locationKm" : "location"
    updateProfile(profile.handle, {
      name,
      handle,
      avatar: values.avatar,
      [bioKey]: values.bio,
      [locationKey]: values.location.trim(),
    })
    setSaving(false)
    onOpenChange(false)
    toast.success(t("profile.updatedTitle"), { description: t("profile.updatedBody") })
    if (handle !== profile.handle) {
      navigate({ to: "/profile", search: { handle } })
    }
  }

  const overLimit = values.bio.length > BIO_LIMIT

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "gap-0 p-0",
          "max-sm:h-dvh max-sm:max-h-dvh max-sm:w-screen max-sm:max-w-none max-sm:translate-x-[-50%] max-sm:translate-y-[-50%] max-sm:overflow-y-auto max-sm:rounded-none max-sm:border-0",
          "sm:w-[calc(100vw-2rem)] sm:max-w-[460px]",
        )}
      >
        <form onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-4 p-4 sm:p-6">
            <DialogHeader className="pr-10">
              <DialogTitle>{t("profile.editTitle")}</DialogTitle>
              <DialogDescription
                className={cn(language === "km" && "leading-relaxed")}
              >
                {t("profile.editSubtitle")}
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-3">
              {values.avatar ? (
                <img
                  src={values.avatar}
                  alt={t("profile.photoPreview")}
                  className="size-11 shrink-0 rounded-full object-cover ring-1 ring-border"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground"
                >
                  {values.name.charAt(0)}
                </span>
              )}
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    aria-label={t("profile.changePhoto")}
                    className="hidden"
                    onChange={(event) => {
                      pickPhoto(event.target.files?.[0])
                      event.target.value = ""
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon aria-hidden="true" className="size-4" />
                    {t("profile.changePhoto")}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setValues((prev) => ({ ...prev, avatar: undefined }))}
                  >
                    <Trash2Icon aria-hidden="true" className="size-4" />
                    {t("profile.removePhoto")}
                  </Button>
                </div>
                <p className={cn("text-xs text-muted-foreground", language === "km" && "leading-relaxed")}>
                  {t("profile.photoHint")}
                </p>
              </div>
            </div>

            <FieldGroup className="gap-3">
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="profile-name">{t("profile.name")}</FieldLabel>
                <Input
                  id="profile-name"
                  className={inputClass}
                  value={values.name}
                  aria-invalid={!!errors.name}
                  onChange={(event) => setValue("name", event.target.value)}
                />
                <FieldError className="hidden sm:block">{errors.name}</FieldError>
              </Field>

              <Field data-invalid={!!errors.handle}>
                <FieldLabel htmlFor="profile-handle">{t("profile.handle")}</FieldLabel>
                <InputGroup className="h-11">
                  <InputGroupAddon align="inline-start" className="text-muted-foreground">
                    @
                  </InputGroupAddon>
                  <InputGroupInput
                    id="profile-handle"
                    value={values.handle}
                    aria-invalid={!!errors.handle}
                    onChange={(event) => setValue("handle", event.target.value)}
                  />
                </InputGroup>
                {errors.handle ? (
                  <FieldError className="hidden sm:block">{errors.handle}</FieldError>
                ) : (
                  <p className={cn("text-xs text-muted-foreground", language === "km" && "leading-relaxed")}>
                    {t("profile.handleHint")}
                  </p>
                )}
              </Field>

              <Field data-invalid={overLimit}>
                <div className="flex items-center justify-between gap-2">
                  <FieldLabel htmlFor="profile-bio">{t("profile.bio")}</FieldLabel>
                  <span
                    className={cn(
                      "text-xs text-muted-foreground",
                      overLimit && "font-medium text-destructive",
                    )}
                  >
                    {values.bio.length}/{BIO_LIMIT}
                  </span>
                </div>
                <Textarea
                  id="profile-bio"
                  rows={3}
                  className="rounded-lg text-base md:text-sm"
                  value={values.bio}
                  aria-invalid={overLimit}
                  onChange={(event) => setValue("bio", event.target.value)}
                />
                <FieldError className="hidden sm:block">{errors.bio}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="profile-location">{t("profile.location")}</FieldLabel>
                <Input
                  id="profile-location"
                  className={inputClass}
                  value={values.location}
                  onChange={(event) => setValue("location", event.target.value)}
                />
              </Field>
            </FieldGroup>

            <DialogFooter className="gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => onOpenChange(false)}
              >
                {t("profile.cancel")}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? t("profile.saving") : t("profile.save")}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
