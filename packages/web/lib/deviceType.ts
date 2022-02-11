export function isIOS(): boolean {
  return (
    [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod',
    ].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
  )
}

export function isAndroid(): boolean {
  return navigator.userAgent.includes('Android')
}

export function isTouchScreenDevice(): boolean {
  return isAndroid() || isIOS()
}
