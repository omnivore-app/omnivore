import '../styles/globals.css'
import '../styles/articleInnerStyling.css'
import 'react-pro-sidebar/dist/css/styles.css'
import '../styles/menu.css'

import type { AppProps } from 'next/app'
import { IdProvider } from '@radix-ui/react-id'
import { NextRouter, useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Analytics, AnalyticsBrowser } from '@segment/analytics-next'
import { segmentApiKey } from '../lib/appConfig'
import { TooltipProvider } from '../components/elements/Tooltip'
import TopBarProgress from 'react-topbar-progress-indicator'
import {
  KBarProvider,
  KBarPortal,
  KBarPositioner,
  KBarAnimator,
  KBarSearch,
  Priority,
} from 'kbar'
import { animatorStyle, KBarResultsComponents, searchStyle } from '../components/elements/KBar'
import { updateTheme } from '../lib/themeUpdater'
import { ThemeId } from '../components/tokens/stitches.config'

TopBarProgress.config({
  barColors: {
    "0": '#FFD234',
    "1.0": '#FFD234',
  },
  shadowBlur: 0,
  barThickness: 2,
})

const generateActions = (router: NextRouter) => {
  const defaultActions = [
    {
      id: 'home',
      section: 'Navigation',
      name: 'Go to Home (Library) ',
      shortcut: ['g', 'h'],
      keywords: 'go home',
      perform: () => router?.push('/home'),
    },
    {
      id: 'lightTheme',
      section: 'Preferences',
      name: 'Change theme (light) ',
      shortcut: ['v', 'l'],
      keywords: 'light theme',
      priority: Priority.LOW,
      perform: () => updateTheme(ThemeId.Light),
    },
    {
      id: 'darkTheme',
      section: 'Preferences',
      name: 'Change theme (dark) ',
      shortcut: ['v', 'd'],
      keywords: 'dark theme',
      priority: Priority.LOW,
      perform: () => updateTheme(ThemeId.Dark),
    },
    {
      id: 'sepiaTheme',
      section: 'Preferences',
      name: 'Change theme (sepia) ',
      shortcut: ['v', 's'],
      keywords: 'sepia theme',
      priority: Priority.LOW,
      perform: () => updateTheme(ThemeId.Sepia),
    },
  ]

  return defaultActions
}

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
    <KBarProvider actions={generateActions(router)}>
      <KBarPortal>
        <KBarPositioner>
          <KBarAnimator style={animatorStyle}>
            <KBarSearch style={searchStyle} />
            <KBarResultsComponents />
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      <IdProvider>
        <TooltipProvider delayDuration={200}>
          <Component {...pageProps} />
        </TooltipProvider>
      </IdProvider>
    </KBarProvider>
  )
}

export default OmnivoreApp
