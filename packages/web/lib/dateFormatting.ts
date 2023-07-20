//https://github.com/you-dont-need/You-Dont-Need-Momentjs

export const locale = Intl.DateTimeFormat().resolvedOptions().locale || 'en-US'
// get the user's time zone
export const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

export function formattedLongDate(rawDate: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
    timeZone,
  }).format(new Date(rawDate))
}

export function formattedShortDate(rawDate: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
    timeZone,
  }).format(new Date(rawDate))
}

export function formattedShortTime(rawDate: string): string {
  return new Intl.DateTimeFormat(locale, {
    timeStyle: 'short',
    timeZone,
  }).format(new Date(rawDate))
}

export function formattedDateTime(rawDate: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone,
  }).format(new Date(rawDate))
}
