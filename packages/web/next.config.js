const ContentSecurityPolicy = `
  default-src 'none';
  base-uri 'self';
  block-all-mixed-content;
  connect-src 'self' api-prod.omnivore.app api-demo.omnivore.app proxy-prod.omnivore-image-cache.app proxy-demo.omnivore-image-cache.app api.segment.io cdn.segment.com widget.intercom.io api-iam.intercom.io wss://nexus-websocket-a.intercom.io platform.twitter.com;
  font-src 'self';
  form-action 'self' api-prod.omnivore.app api-demo.omnivore.app;
  frame-ancestors 'none';
  frame-src 'none';
  manifest-src 'self';
  script-src script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self';
  manifest-src 'self';
`

const moduleExports = {
  images: {
    domains: [
      'proxy-demo.omnivore-image-cache.app',
      'proxy-dev.omnivore-image-cache.app',
      'proxy.omnivore-image-cache.app',
    ],
  },
  rewrites: () => [
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
    },
  ],
  Headers: [
    {
      key: 'Content-Security-Policy',
      value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
    },
  ],
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
