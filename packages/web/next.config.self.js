const moduleExports = {
  rewrites: () => {
    const rewrites = []
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
  }
}

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
module.exports = withBundleAnalyzer(moduleExports)
