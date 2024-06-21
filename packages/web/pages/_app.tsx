import '../styles/globals.css'
import '../styles/articleInnerStyling.css'

import type { AppProps } from 'next/app'
import { IdProvider } from '@radix-ui/react-id'
import { NextRouter, useRouter } from 'next/router'
import { ReactNode, useEffect, useState } from 'react'
import TopBarProgress from 'react-topbar-progress-indicator'
import {
  KBarProvider,
  KBarPortal,
  KBarPositioner,
  KBarAnimator,
  KBarSearch,
  Priority,
} from 'kbar'
import {
  animatorStyle,
  KBarResultsComponents,
  searchStyle,
} from '../components/elements/KBar'
import { updateTheme } from '../lib/themeUpdater'
import { ThemeId } from '../components/tokens/stitches.config'
import { posthog } from 'posthog-js'
import { GoogleReCaptchaProvider } from '@google-recaptcha/react'
import { SWRConfig } from 'swr'

TopBarProgress.config({
  barColors: {
    '0': '#FFD234',
    '1.0': '#FFD234',
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
      perform: () => {
        const navReturn = window.localStorage.getItem('nav-return')
        if (navReturn) {
          router.push(navReturn)
          return
        }
        router?.push('/l/home')
      },
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
  ]

  return defaultActions
}

const ConditionalCaptchaProvider = (props: {
  children: ReactNode
}): JSX.Element => {
  if (process.env.NEXT_PUBLIC_RECAPTCHA_CHALLENGE_SITE_KEY) {
    return (
      <GoogleReCaptchaProvider
        type="v2-checkbox"
        isEnterprise={true}
        host="recaptcha.net"
        siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_CHALLENGE_SITE_KEY ?? ''}
      >
        {props.children}
      </GoogleReCaptchaProvider>
    )
  }
  return <>{props.children}</>
}

export function OmnivoreApp({ Component, pageProps }: AppProps): JSX.Element {
  const router = useRouter()

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      posthog.capture('$pageview')
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  return (
    <ConditionalCaptchaProvider>
      <KBarProvider actions={generateActions(router)}>
        <KBarPortal>
          <KBarPositioner style={{ zIndex: 100 }}>
            <KBarAnimator style={animatorStyle}>
              <KBarSearch style={searchStyle} />
              <KBarResultsComponents />
            </KBarAnimator>
          </KBarPositioner>
        </KBarPortal>
        <IdProvider>
          <Component {...pageProps} />
        </IdProvider>
      </KBarProvider>
    </ConditionalCaptchaProvider>
  )
}

export default OmnivoreApp
