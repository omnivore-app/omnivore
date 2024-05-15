import crypto from 'crypto'
import { encode } from 'urlsafe-base64'
import { env } from '../env'

function signImageProxyUrl(url: string): string {
  return encode(
    crypto.createHmac('sha256', env.imageProxy.secretKey).update(url).digest()
  )
}

export function createImageProxyUrl(
  url: string,
  width = 0,
  height = 0
): string {
  if (!env.imageProxy.url || !env.imageProxy.secretKey) {
    return url
  }

  // url is already signed
  if (url.startsWith(env.imageProxy.url)) {
    return url
  }

  const urlWithOptions = `${url}#${width}x${height}`
  const signature = signImageProxyUrl(urlWithOptions)

  return `${env.imageProxy.url}/${width}x${height},s${signature}/${url}`
}

export const createThumbnailProxyUrl = (url: string): string =>
  createImageProxyUrl(url, 320, 320)
