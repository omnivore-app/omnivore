const ContentSecurityPolicy = `
  default-src 'self';
  base-uri 'self';
  connect-src 'self' ${process.env.NEXT_PUBLIC_SERVER_BASE_URL} https://proxy-prod.omnivore-image-cache.app https://accounts.google.com https://proxy-demo.omnivore-image-cache.app https://storage.googleapis.com https://widget.intercom.io https://api-iam.intercom.io https://static.intercomassets.com https://downloads.intercomcdn.com https://platform.twitter.com wss://nexus-websocket-a.intercom.io wss://nexus-websocket-b.intercom.io wss://nexus-europe-websocket.intercom.io wss://nexus-australia-websocket.intercom.io https://uploads.intercomcdn.com https://tools.applemediaservices.com;
  font-src 'self' data: https://cdn.jsdelivr.net https://js.intercomcdn.com https://fonts.intercomcdn.com;
  form-action 'self' ${process.env.NEXT_PUBLIC_SERVER_BASE_URL} https://getpocket.com/auth/authorize https://intercom.help https://api-iam.intercom.io https://api-iam.eu.intercom.io https://api-iam.au.intercom.io https://www.notion.so https://api.notion.com;
  frame-ancestors 'none';
  frame-src 'self' https://accounts.google.com https://platform.twitter.com https://www.youtube.com https://www.youtube-nocookie.com https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/;
  manifest-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' accounts.google.com https://widget.intercom.io https://js.intercomcdn.com https://platform.twitter.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/;
  style-src 'self' 'unsafe-inline' https://accounts.google.com https://cdnjs.cloudflare.com;
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
      source: '/collect/:match*',
      destination: 'https://app.posthog.com/:match*',
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
          'https://chrome.google.com/webstore/detail/omnivore/blkggjdmcfjdbmmmlfcpplkchpeaiiab/',
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
