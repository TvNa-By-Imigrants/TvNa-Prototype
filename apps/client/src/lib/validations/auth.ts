import { z } from "zod"

/** Also used as the input's maxLength so typing stops before the error. */
// shortcut: enforced in the client only; the sign-up API accepts any name.
// Add a server-side validator if the name ever renders somewhere unsafe.
export const NAME_MAX_LENGTH = 30
/** Letters (any script, incl. Khmer marks) and spaces only. */
export const NAME_PATTERN = /^[\p{L}\p{M}\s]+$/u

export type AuthMessages = {
  nameRequired: string
  nameTooLong: string
  nameInvalid: string
  emailRequired: string
  emailInvalid: string
  passwordRequired: string
  passwordTooShort: string
  confirmRequired: string
  confirmMismatch: string
  termsRequired: string
}

/** Kept as two schemas so each form keeps its own value shape (no unions). */
export function createLoginSchema(messages: AuthMessages) {
  return z.object({
    email: z
      .string()
      .min(1, messages.emailRequired)
      .email(messages.emailInvalid),
    password: z
      .string()
      .min(1, messages.passwordRequired)
      .min(8, messages.passwordTooShort),
  })
}

export function createRegisterSchema(messages: AuthMessages) {
  return z
    .object({
      name: z
        .string()
        .trim()
        .min(1, messages.nameRequired)
        .max(NAME_MAX_LENGTH, messages.nameTooLong)
        .regex(NAME_PATTERN, messages.nameInvalid),
      email: z
        .string()
        .min(1, messages.emailRequired)
        .email(messages.emailInvalid),
      password: z
        .string()
        .min(1, messages.passwordRequired)
        .min(8, messages.passwordTooShort),
      confirmPassword: z.string().min(1, messages.confirmRequired),
      acceptTerms: z.literal(true, { message: messages.termsRequired }),
    })
    .refine((value) => value.confirmPassword === value.password, {
      message: messages.confirmMismatch,
      path: ["confirmPassword"],
    })
}
