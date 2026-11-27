import { useCallback, useEffect, useState, type FormEvent } from "react"
import { EyeIcon, EyeOffIcon, LogOutIcon, TriangleAlertIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/atom/common/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
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
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { LogoMark } from "@/components/shell/logo"
import { useLanguage, type TranslationKey } from "@/i18n"
import { signIn, signUp } from "@/lib/auth"
import type { AuthMode } from "@/lib/auth-dialog"
import { cn } from "@/lib/utils"
import {
  createLoginSchema,
  createRegisterSchema,
  type AuthMessages,
} from "@/lib/validations/auth"

export type { AuthMode }

export type AuthDialogProps = {
  open: boolean
  mode: AuthMode
  onOpenChange: (open: boolean) => void
  onSignedIn?: () => void
}

const messagesFor = (t: (key: TranslationKey) => string): AuthMessages => ({
  nameRequired: t("auth.errNameRequired"),
  emailRequired: t("auth.errEmailRequired"),
  emailInvalid: t("auth.errEmailInvalid"),
  passwordRequired: t("auth.errPasswordRequired"),
  passwordTooShort: t("auth.errPasswordShort"),
  confirmRequired: t("auth.errConfirmRequired"),
  confirmMismatch: t("auth.errConfirmMismatch"),
  termsRequired: t("auth.errTermsRequired"),
})

const inputClass = "h-11 rounded-lg px-3 text-base md:text-sm"

export function AuthDialog({
  open,
  mode,
  onOpenChange,
  onSignedIn,
}: AuthDialogProps) {
  const { language, t } = useLanguage()
  const [activeMode, setActiveMode] = useState<AuthMode>(mode)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [values, setValues] = useState<Record<string, string>>({})
  const [rememberMe, setRememberMe] = useState(true)
  const [acceptTerms, setAcceptTerms] = useState(false)

  const isLogin = activeMode === "login"
  const messages = messagesFor(t)

  const reset = useCallback((next: AuthMode) => {
    setActiveMode(next)
    setErrors({})
    setValues({})
    setShowPassword(false)
    setShowConfirm(false)
    setAcceptTerms(false)
  }, [])

  // The shell keeps this dialog mounted, so the initial mode would otherwise
  // stick and the Register button would open the login form.
  useEffect(() => {
    if (!open) return
    reset(mode)
  }, [open, mode, reset])

  const setValue = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const fail = (title: string, description: string, field?: string) => {
    toast.error(title, { description, duration: 6000 })
    if (field) setErrors((prev) => ({ ...prev, [field]: description }))
  }

  // One toast per failed submit: on a phone the field errors are hidden, so
  // this is the only text explaining why the form refused.
  const failValidation = (issues: { path: (string | number | symbol)[]; message: string }[]) => {
    setErrors(fieldErrors(issues))
    toast.error(t("auth.errValidationTitle"), {
      description: t("auth.errValidationBody"),
      duration: 6000,
    })
  }

  const submitLogin = async (email: string, password: string) => {
    const result = await signIn(email, password, rememberMe)
    if (result.ok) {
      onOpenChange(false)
      onSignedIn?.()
      return
    }
    fail(
      t("auth.errSignInTitle"),
      result.status === 401
        ? t("auth.errIncorrectCredentials")
        : t("auth.errGeneric"),
      result.status === 401 ? "password" : undefined,
    )
  }

  const submitRegister = async (
    name: string,
    email: string,
    password: string,
  ) => {
    const result = await signUp(name, email, password)
    if (result.ok) {
      onOpenChange(false)
      onSignedIn?.()
      return
    }
    // better-auth answers 422 for an existing email.
    fail(
      t("auth.errSignUpTitle"),
      result.status === 422
        ? t("auth.errDuplicateEmail")
        : t("auth.errGeneric"),
      result.status === 422 ? "email" : undefined,
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isLogin) {
      const parsed = createLoginSchema(messages).safeParse({
        email: values.email ?? "",
        password: values.password ?? "",
      })
      if (!parsed.success) {
        failValidation(parsed.error.issues)
        return
      }
      setSubmitting(true)
      try {
        await submitLogin(parsed.data.email, parsed.data.password)
      } finally {
        setSubmitting(false)
      }
      return
    }

    const parsed = createRegisterSchema(messages).safeParse({
      name: values.name ?? "",
      email: values.email ?? "",
      password: values.password ?? "",
      confirmPassword: values.confirmPassword ?? "",
      acceptTerms,
    })
    if (!parsed.success) {
      failValidation(parsed.error.issues)
      return
    }
    setSubmitting(true)
    try {
      await submitRegister(parsed.data.name, parsed.data.email, parsed.data.password)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "gap-0 p-0",
          "max-sm:h-dvh max-sm:max-h-dvh max-sm:w-screen max-sm:max-w-none max-sm:translate-x-[-50%] max-sm:translate-y-[-50%] max-sm:overflow-y-auto max-sm:rounded-none max-sm:border-0",
          "sm:w-[calc(100vw-2rem)] sm:max-w-[420px]",
        )}
      >
        <div className="flex flex-col gap-3 p-4 sm:gap-5 sm:p-6">
          <header className="flex flex-col gap-1.5 pr-8 sm:items-center sm:gap-3 sm:pr-0 sm:text-center">
            <div className="hidden items-center gap-2 sm:flex">
              <LogoMark className="size-8 rounded-lg" />
              <span className="text-lg font-semibold tracking-tight text-foreground">
                TvNa
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                {t(isLogin ? "auth.loginTitle" : "auth.registerTitle")}
              </h1>
              <p
                className={cn(
                  "text-sm text-muted-foreground",
                  language === "km" && "leading-relaxed",
                )}
              >
                {t(isLogin ? "auth.loginSubtitle" : "auth.registerSubtitle")}
              </p>
            </div>
          </header>

          <form onSubmit={handleSubmit} noValidate>
            <FieldGroup className="gap-2.5 sm:gap-3">
              {!isLogin && (
                <Field data-invalid={!!errors.name}>
                  <FieldLabel htmlFor="auth-name">{t("auth.name")}</FieldLabel>
                  <Input
                    id="auth-name"
                    className={inputClass}
                    autoComplete="name"
                    placeholder={t("auth.namePlaceholder")}
                    value={values.name ?? ""}
                    aria-invalid={!!errors.name}
                    onChange={(event) => setValue("name", event.target.value)}
                  />
                  <FieldError className="hidden sm:block">{errors.name}</FieldError>
                </Field>
              )}

              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="auth-email">{t("auth.email")}</FieldLabel>
                <Input
                  id="auth-email"
                  className={inputClass}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder={t("auth.emailPlaceholder")}
                  value={values.email ?? ""}
                  aria-invalid={!!errors.email}
                  onChange={(event) => setValue("email", event.target.value)}
                />
                <FieldError className="hidden sm:block">{errors.email}</FieldError>
              </Field>

              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="auth-password">{t("auth.password")}</FieldLabel>
                <div className="relative">
                  <Input
                    id="auth-password"
                    className={cn(inputClass, "pr-11")}
                    type={showPassword ? "text" : "password"}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    placeholder={t("auth.passwordPlaceholder")}
                    value={values.password ?? ""}
                    aria-invalid={!!errors.password}
                    onChange={(event) => setValue("password", event.target.value)}
                  />
                  <button
                    type="button"
                    aria-label={t(showPassword ? "auth.hidePassword" : "auth.showPassword")}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="size-4" />
                    ) : (
                      <EyeIcon className="size-4" />
                    )}
                  </button>
                </div>
                <FieldError className="hidden sm:block">{errors.password}</FieldError>
              </Field>

              {isLogin ? (
                <Field orientation="horizontal" className="w-fit">
                  <Checkbox
                    id="auth-remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                  />
                  <FieldLabel htmlFor="auth-remember" className="font-normal">
                    {t("auth.rememberMe")}
                  </FieldLabel>
                </Field>
              ) : (
                <>
                  <Field data-invalid={!!errors.confirmPassword}>
                    <FieldLabel htmlFor="auth-confirm">
                      {t("auth.confirmPassword")}
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        id="auth-confirm"
                        className={cn(inputClass, "pr-11")}
                        type={showConfirm ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder={t("auth.confirmPasswordPlaceholder")}
                        value={values.confirmPassword ?? ""}
                        aria-invalid={!!errors.confirmPassword}
                        onChange={(event) =>
                          setValue("confirmPassword", event.target.value)
                        }
                      />
                      <button
                        type="button"
                        aria-label={t(showConfirm ? "auth.hidePassword" : "auth.showPassword")}
                        aria-pressed={showConfirm}
                        onClick={() => setShowConfirm((prev) => !prev)}
                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {showConfirm ? (
                          <EyeOffIcon className="size-4" />
                        ) : (
                          <EyeIcon className="size-4" />
                        )}
                      </button>
                    </div>
                    <FieldError className="hidden sm:block">
                      {errors.confirmPassword}
                    </FieldError>
                  </Field>

                  <Field data-invalid={!!errors.acceptTerms}>
                    <Field orientation="horizontal">
                      <Checkbox
                        id="auth-terms"
                        checked={acceptTerms}
                        aria-invalid={!!errors.acceptTerms}
                        onCheckedChange={(checked) => {
                          setAcceptTerms(checked === true)
                          setErrors((prev) => {
                            if (!prev.acceptTerms) return prev
                            const next = { ...prev }
                            delete next.acceptTerms
                            return next
                          })
                        }}
                      />
                      <FieldContent className="gap-1">
                        <FieldLabel htmlFor="auth-terms" className="font-normal">
                          {t("auth.agreeTerms")}
                        </FieldLabel>
                        <FieldError className="hidden sm:block">
                          {errors.acceptTerms}
                        </FieldError>
                      </FieldContent>
                    </Field>
                  </Field>
                </>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="h-11 w-full rounded-lg text-base font-semibold"
              >
                {t(
                  submitting
                    ? "auth.submitting"
                    : isLogin
                      ? "auth.loginAction"
                      : "auth.registerAction",
                )}
              </Button>
            </FieldGroup>
          </form>

          <p
            className={cn(
              "text-center text-sm text-muted-foreground",
              language === "km" && "leading-relaxed",
            )}
          >
            {t(isLogin ? "auth.noAccount" : "auth.haveAccount")}{" "}
            <button
              type="button"
              onClick={() => reset(isLogin ? "register" : "login")}
              className="font-semibold text-secondary-foreground underline-offset-4 hover:underline"
            >
              {t(isLogin ? "auth.goRegister" : "auth.goLogin")}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function fieldErrors(issues: { path: (string | number | symbol)[]; message: string }[]) {
  const next: Record<string, string> = {}
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "")
    if (key && !next[key]) next[key] = issue.message
  }
  return next
}

export function LogoutDialog({
  open,
  onOpenChange,
  onConfirm,
  pending,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  pending?: boolean
}) {
  const { language, t } = useLanguage()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-5">
        <div className="flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <LogOutIcon className="size-5" />
        </div>
        <DialogHeader>
          <DialogTitle>{t("auth.logoutTitle")}</DialogTitle>
          <DialogDescription
            className={cn(language === "km" && "leading-relaxed")}
          >
            {t("auth.logoutBody")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            className="h-10"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            {t("auth.logoutCancel")}
          </Button>
          <Button
            variant="destructive"
            className="h-10"
            disabled={pending}
            onClick={onConfirm}
          >
            {pending ? (
              <TriangleAlertIcon className="size-4 animate-pulse" />
            ) : null}
            {t("auth.logoutConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
