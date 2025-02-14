const ContentSecurityPolicy = `
  default-src 'self';
  base-uri 'self';
  connect-src 'self' ${process.env.NEXT_PUBLIC_SERVER_BASE_URL} https://proxy-prod.omnivore-image-cache.app https://accounts.google.com https://proxy-demo.omnivore-image-cache.app https://storage.googleapis.com https://widget.intercom.io https://api-iam.intercom.io https://static.intercomassets.com https://downloads.intercomcdn.com https://platform.twitter.com wss://nexus-websocket-a.intercom.io wss://nexus-websocket-b.intercom.io wss://nexus-europe-websocket.intercom.io wss://nexus-australia-websocket.intercom.io https://uploads.intercomcdn.com https://tools.applemediaservices.com wss://www.tiktok.com *.sentry.io 127.0.0.1 http://localhost:1010; 
  font-src 'self' data: https://cdn.jsdelivr.net https://js.intercomcdn.com https://fonts.intercomcdn.com;
  form-action 'self' ${process.env.NEXT_PUBLIC_SERVER_BASE_URL} https://getpocket.com/auth/authorize https://intercom.help https://api-iam.intercom.io https://api-iam.eu.intercom.io https://api-iam.au.intercom.io https://www.notion.so https://api.notion.com;
  frame-ancestors 'none';
  frame-src 'self' https://accounts.google.com https://platform.twitter.com https://www.youtube.com https://www.youtube-nocookie.com https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/ https://www.recaptcha.net https://www.tiktok.com;
  manifest-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' accounts.google.com https://widget.intercom.io https://js.intercomcdn.com https://platform.twitter.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://www.recaptcha.net https://www.gstatic.cn/ https://*.neutral.ttwstatic.com https://www.tiktok.com/embed.js https://browser.sentry-cdn.com https://js.sentry-cdn.com;
  style-src 'self' 'unsafe-inline' https://accounts.google.com https://cdnjs.cloudflare.com https://*.neutral.ttwstatic.com;
  img-src 'self' blob: data: https:;
  worker-src 'self' blob:;
  media-src https://js.intercomcdn.com;
`

const moduleExports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: [
      'proxy-demo.omnivore-image-cache.app',
      'proxy-dev.omnivore-image-cache.app',
      'proxy.omnivore-image-cache.app',
    ],
  },
  rewrites: () => {
    const rewrites = []
    if (process.env.INCLUDE_LEGACY_REWRITES) {
      rewrites.push(
        {
          source: '/api/graphql',
          destination: `https://api-${process.env.NEXT_PUBLIC_APP_ENV}.omnivore.app/api/graphql`,
        },
        {
          source: '/api/auth/:path*',
          destination: `https://api-${process.env.NEXT_PUBLIC_APP_ENV}.omnivore.app/api/auth/:path*`,
        },
        {
          source: '/api/article/save',
          destination: `https://api-${process.env.NEXT_PUBLIC_APP_ENV}.omnivore.app/api/article/save`,
        },
        {
          source: '/api/mobile-auth/:path*',
          destination: `https://api-${process.env.NEXT_PUBLIC_APP_ENV}.omnivore.app/api/mobile-auth/:path*`,
        }
      )
    }
    rewrites.push({
      source: '/home',
      destination: '/l/home',
    })
    rewrites.push({
      source: '/library',
      destination: '/l/library',
    })
    rewrites.push({
      source: '/subscriptions',
      destination: '/l/subscriptions',
    })
    rewrites.push({
      source: '/highlights',
      destination: '/l/highlights',
    })
    rewrites.push({
      source: '/subscriptions',
      destination: '/l/subscriptions',
    })
    rewrites.push({
      source: '/search',
      destination: '/l/search',
    })
    rewrites.push({
      source: '/archive',
      destination: '/l/archive',
    })
    rewrites.push({
      source: '/trash',
      destination: '/l/trash',
    })
    return rewrites
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
          },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/feedback',
        destination: '/support',
        permanent: true,
      },
      {
        source: '/contact',
        destination: '/support',
        permanent: true,
      },
      {
        source: '/settings/rss',
        destination: '/settings/feeds',
        permanent: true,
      },
      {
        source: '/settings/rss/add',
        destination: '/settings/feeds/add',
        permanent: true,
      },
      {
        source: '/settings/subscriptions/newsletters',
        destination: '/settings/emails',
        permanent: true,
      },
      {
        source: '/static/icons/favicon-dark.ico',
        destination: '/favicon-dark.ico',
        permanent: true,
      },
      {
        source: '/static/icons/favicon-light.ico',
        destination: '/favicon.ico',
        permanent: true,
      },
      {
        source: '/static/icons/pwa/default-large.png',
        destination: '/pwa-512.png',
        permanent: true,
      },
      {
        source: '/static/icons/pwa/default-maskable-large.png',
        destination: '/pwa-maskable-512.png',
        permanent: true,
      },
      {
        source: '/static/icons/pwa/default-maskable.png',
        destination: '/pwa-maskable-192.png',
        permanent: true,
      },
      {
        source: '/static/icons/pwa/default.png',
        destination: '/pwa-192.png',
        permanent: true,
      },
      {
        source: '/static/icons/pwa/icon-default.png',
        destination: '/pwa-maskable-192.png',
        permanent: true,
      },
      {
        source: '/SECURITY.md',
        destination: '/.well-known/security.txt',
        permanent: true,
      },
      {
        source: '/security.md',
        destination: '/.well-known/security.txt',
        permanent: true,
      },
      {
        source: '/security.txt',
        destination: '/.well-known/security.txt',
        permanent: true,
      },
      {
        source: '/hackers.txt',
        destination: '/.well-known/security.txt',
        permanent: true,
      },
      {
        source: '/.well-known/security.txt',
        destination: '/static/well-known/security.txt',
        permanent: true,
      },
      {
        source: '/privacy',
        destination: 'https://docs.omnivore.app/about/privacy-policy',
        permanent: true,
      },
      {
        source: '/install/chrome',
        destination:
          'https://chromewebstore.google.com/detail/omnivore/blkggjdmcfjdbmmmlfcpplkchpeaiiab',
        permanent: true,
      },
      {
        source: '/install/firefox',
        destination: 'https://addons.mozilla.org/en-US/firefox/addon/omnivore/',
        permanent: true,
      },
      {
        source: '/install/edge',
        destination:
          'https://microsoftedge.microsoft.com/addons/detail/omnivore/ipebjboljeobckndaookadioffchlnih',
        permanent: true,
      },
      {
        source: '/install/ios',
        destination:
          'https://apps.apple.com/us/app/omnivore-read-highlight-share/id1564031042',
        permanent: true,
      },
      {
        source: '/install/mac',
        destination:
          'https://apps.apple.com/us/app/omnivore-read-highlight-share/id1564031042',
        permanent: true,
      },
      {
        source: '/install/macos',
        destination:
          'https://apps.apple.com/us/app/omnivore-read-highlight-share/id1564031042',
        permanent: true,
      },
      {
        source: '/install/safari',
        destination:
          'https://apps.apple.com/us/app/omnivore-read-highlight-share/id1564031042',
        permanent: true,
      },
      {
        source: '/install/apple',
        destination:
          'https://apps.apple.com/us/app/omnivore-read-highlight-share/id1564031042',
        permanent: true,
      },
      {
        source: '/install/android',
        destination:
          'https://play.google.com/store/apps/details?id=app.omnivore.omnivore&pli=1',
        permanent: true,
      },
    ]
  },
}

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
module.exports = withBundleAnalyzer(moduleExports)

// Injected content via Sentry wizard below

const { withSentryConfig } = require('@sentry/nextjs')

module.exports = withSentryConfig(module.exports, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: 'omnivore',
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
})
