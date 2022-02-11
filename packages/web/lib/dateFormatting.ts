//https://github.com/you-dont-need/You-Dont-Need-Momentjs

const locale = 'en-US' //navigator?.language ?? 'en-US'

export function formattedLongDate(rawDate: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
  }).format(new Date(rawDate))
}

export function readableUpdatedAtMessage(
  rawDate: string,
  customPrefix?: string
): string {
  const prefix = customPrefix || 'Updated '
  const timeElapsed = Math.ceil(
    new Date().valueOf() - new Date(rawDate).valueOf()
  )
  const secondsElapsed = timeElapsed / 1000

  if (secondsElapsed < 60) {
    return `${prefix} a few seconds ago`
  }

  if (secondsElapsed < 3600) {
    return `${prefix} ${Math.floor(secondsElapsed / 60)} minutes ago`
  }

  if (secondsElapsed < 86400) {
    return `${prefix} ${Math.floor(secondsElapsed / 3600)} hours ago`
  }

  if (secondsElapsed < 604800) {
    return `${prefix} ${Math.floor(secondsElapsed / 86400)} days ago`
  }

  if (secondsElapsed < 2592000) {
    return `${prefix} ${Math.floor(secondsElapsed / 604800)} weeks ago`
  }

  if (secondsElapsed < 31536000) {
    return `${prefix} ${Math.floor(secondsElapsed / 2592000)} months ago`
  }

  if (secondsElapsed < 315360000) {
    return `${prefix} ${Math.floor(secondsElapsed / 31536000)} years ago`
  }

  if (secondsElapsed < 3153600000) {
    return `${prefix} ${Math.floor(secondsElapsed / 315360000)} decades ago`
  }

  return ''
}
