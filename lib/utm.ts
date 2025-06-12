export function addUtmParams(url: string): string {
  const u = new URL(url)
  u.searchParams.set("utm_source", "mi_libro")
  u.searchParams.set("utm_medium", "landing")
  u.searchParams.set("utm_campaign", "renuncio")
  return u.toString()
}
