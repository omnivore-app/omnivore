import '../styles/globals.css'
import '../styles/articleInnerStyling.css'
import type { AppProps } from 'next/app'
import { IdProvider } from '@radix-ui/react-id'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Analytics, AnalyticsBrowser } from '@segment/analytics-next'
import { segmentApiKey } from '../lib/appConfig'
import { TooltipProvider } from '../components/elements/Tooltip'
import TopBarProgress from 'react-topbar-progress-indicator'

TopBarProgress.config({
  barColors: {
    "0": '#FFD234',
    "1.0": '#FFD234',
  },
  shadowBlur: 0,
  barThickness: 2,
});

function OmnivoreApp({ Component, pageProps }: AppProps): JSX.Element {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<Analytics | undefined>(undefined)

  useEffect(() => {
    const loadAnalytics = async () => {
      const writeKey = segmentApiKey
      if (writeKey) {
        try {
          const [response] = await AnalyticsBrowser.load({ writeKey })
          window.analytics = response
          setAnalytics(response)
          analytics?.track('init_session')
        } catch (error) {
          console.log('error loading analytics', error)
        }
      }
    }
    loadAnalytics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      analytics?.page(url)
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events, analytics])

  return (
    <IdProvider>
      <TooltipProvider delayDuration={200}>
        <Component {...pageProps} />
      </TooltipProvider>
    </IdProvider>
  )
}

export default OmnivoreApp
