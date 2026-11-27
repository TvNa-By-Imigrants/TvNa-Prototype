import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  openAuthDialog,
  onAuthDialogRequest,
  takeAuthDialogRequest,
} from '@/lib/auth-dialog'

describe('auth dialog requests', () => {
  beforeEach(() => {
    takeAuthDialogRequest()
  })

  it('holds the requested mode until the shell drains it', () => {
    openAuthDialog('register')

    expect(takeAuthDialogRequest()).toBe('register')
    // Drained: a second read must not reopen it.
    expect(takeAuthDialogRequest()).toBeNull()
  })

  it('defaults to login', () => {
    openAuthDialog()

    expect(takeAuthDialogRequest()).toBe('login')
  })

  it('notifies listeners so a mounted shell opens immediately', () => {
    const listener = vi.fn()
    const unsubscribe = onAuthDialogRequest(listener)

    openAuthDialog('login')
    expect(listener).toHaveBeenCalledTimes(1)

    unsubscribe()
    openAuthDialog('login')
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
