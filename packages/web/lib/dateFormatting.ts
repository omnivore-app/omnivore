//https://github.com/you-dont-need/You-Dont-Need-Momentjs

const locale = Intl.DateTimeFormat().resolvedOptions().locale || 'en-US'

export function formattedLongDate(rawDate: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
  }).format(new Date(rawDate))
}

export function formattedShortDate(rawDate: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
  }).format(new Date(rawDate))
}
