export const INVITE_TOKEN_KEY = 'life-archive.inviteToken'

export function buildInvitePath(token: string) {
  return `/dashboard/invite?token=${encodeURIComponent(token)}`
}

export function buildInviteLink(token: string, origin = window.location.origin) {
  return `${origin}${buildInvitePath(token)}`
}

export function storeInviteToken(token: string) {
  if (typeof window === 'undefined' || !token) return
  sessionStorage.setItem(INVITE_TOKEN_KEY, token)
}

export function readInviteToken(fallback = '') {
  if (typeof window === 'undefined') return fallback
  return sessionStorage.getItem(INVITE_TOKEN_KEY) || fallback
}

export function clearInviteToken() {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(INVITE_TOKEN_KEY)
}

export function buildAuthNextPath(path: string) {
  return encodeURIComponent(path)
}
