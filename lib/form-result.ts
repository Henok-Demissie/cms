/**
 * Result contract for form server actions driven from a popover. Actions return
 * this instead of throwing or redirecting, so the popover can stay put, show the
 * error inline, and only close on success.
 */
export type FormResult = { ok: true; message?: string } | { ok: false; error: string }
