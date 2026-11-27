import { z } from "zod"

export type AuthMessages = {
  nameRequired: string
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
      name: z.string().trim().min(1, messages.nameRequired),
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
