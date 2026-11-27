export function createShareUrl(
  token: string,
  origin: string = typeof window === "undefined" ? "" : window.location.origin,
): string {
  return `${origin}/shared/${encodeURIComponent(token)}`
}
