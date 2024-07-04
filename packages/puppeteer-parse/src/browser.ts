import { Browser } from 'puppeteer-core'
import puppeteer from 'puppeteer-extra'
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

puppeteer.use(StealthPlugin())
puppeteer.use(AdblockerPlugin({ blockTrackers: true }))

let browserInstance: Browser | null = null

const handleDisconnection = async () => {
  console.log('Browser disconnected, reconnecting...')
  browserInstance = null
  await getBrowser()
}

export const getBrowser = async (): Promise<Browser> => {
  if (browserInstance) {
    return browserInstance
  }

  console.log('Starting puppeteer browser')

  browserInstance = (await puppeteer.launch({
    args: [
      '--autoplay-policy=user-gesture-required',
      '--disable-component-update',
      '--disable-domain-reliability',
      '--disable-features=AudioServiceOutOfProcess,IsolateOrigins,site-per-process',
      '--disable-print-preview',
      '--disable-setuid-sandbox',
      '--disable-site-isolation-trials',
      '--disable-speech-api',
      '--disk-cache-size=33554432',
      '--enable-features=SharedArrayBuffer',
      '--hide-scrollbars',
      '--disable-gpu',
      '--mute-audio',
      '--no-default-browser-check',
      '--no-pings',
      '--no-sandbox',
      '--no-zygote',
      '--window-size=1920,1080',
      '--disable-extensions',
      '--disable-dev-shm-usage',
      '--no-first-run',
      '--disable-background-networking',
    ],
    defaultViewport: {
      deviceScaleFactor: 1,
      hasTouch: false,
      height: 1080,
      isLandscape: true,
      isMobile: false,
      width: 1920,
    },
    executablePath: process.env.CHROMIUM_PATH,
    headless: !!process.env.LAUNCH_HEADLESS,
    timeout: 30_000, // 30 seconds
    dumpio: true, // show console logs in the terminal
  })) as Browser

  const version = await browserInstance.version()
  console.log('Browser started', version)

  browserInstance.on('disconnected', () => {
    void handleDisconnection()
  })

  return browserInstance
}

export const closeBrowser = async (): Promise<void> => {
  if (browserInstance) {
    console.log('Closing browser...')
    try {
      await browserInstance.close()
      console.log('Browser closed successfully')
    } catch (error) {
      console.error('Error closing browser:', error)
    } finally {
      browserInstance = null
    }
  } else {
    console.log('No browser instance to close')
  }
}
