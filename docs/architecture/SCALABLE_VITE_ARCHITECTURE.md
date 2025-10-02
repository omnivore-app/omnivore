# 🏗️ Scalable Vite Architecture for Omnivore Multi-Platform

## 🎯 Executive Summary

Design a **modular, extensible Vite architecture** that supports multiple web interfaces while maintaining compatibility with mobile apps and browser extensions. This architecture enables rapid development while providing a foundation for future micro-frontend scaling.

---

## 📊 Current Multi-Platform Architecture Analysis

### **Current Client Landscape**

| Platform              | Technology       | API Communication | Current State              |
| --------------------- | ---------------- | ----------------- | -------------------------- |
| **Web App**           | Next.js + React  | GraphQL + REST    | Monolithic, slow builds    |
| **iOS App**           | SwiftUI + Swift  | GraphQL + REST    | Native, Apollo Client      |
| **Android App**       | Kotlin + Compose | GraphQL + REST    | Native, Apollo Client      |
| **Browser Extension** | Vanilla JS       | GraphQL + REST    | Content scripts, API calls |
| **Safari Extension**  | Swift + JS       | GraphQL + REST    | Native messaging           |

### **Current API Communication Patterns**

```typescript
// All clients use similar patterns:
// 1. GraphQL for data fetching
// 2. REST for authentication
// 3. JWT tokens for auth
// 4. Same backend endpoints

// Web (Next.js)
const { data } = useSWR([query, variables], makeGqlFetcher(query, variables))

// Mobile (iOS/Android)
let apolloClient = ApolloClient.Builder()
  .serverUrl(serverUrl())
  .addHttpHeader('Authorization', authToken())
  .build()

// Extension (JavaScript)
fetch(url, {
  method: 'POST',
  headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
  body: JSON.stringify(query),
})
```

---

## 🚀 Proposed Vite Architecture

### **1. Modular Package Structure**

```
packages/
├── web-vite/                 # Main Vite application
│   ├── src/
│   │   ├── apps/            # Different web interfaces
│   │   │   ├── main/        # Primary web app
│   │   │   ├── reader/      # Standalone reader
│   │   │   ├── admin/       # Admin interface
│   │   │   └── embed/       # Embedded widgets
│   │   ├── shared/          # Shared components & utilities
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── services/    # API services
│   │   │   ├── stores/      # State management
│   │   │   └── types/       # TypeScript definitions
│   │   └── lib/             # Core libraries
│   ├── vite.config.ts       # Vite configuration
│   └── package.json
├── shared/                   # Cross-platform shared code
│   ├── api-client/          # GraphQL client
│   ├── types/               # Shared TypeScript types
│   ├── utils/               # Utility functions
│   └── constants/           # Shared constants
└── web/                     # Legacy Next.js (during migration)
```

### **2. Multi-App Vite Configuration**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ command, mode }) => {
  const app = process.env.VITE_APP || 'main'

  return {
    plugins: [react()],
    root: `src/apps/${app}`,
    build: {
      outDir: `../../dist/${app}`,
      rollupOptions: {
        input: {
          main: resolve(__dirname, `src/apps/${app}/index.html`),
        },
      },
    },
    resolve: {
      alias: {
        '@shared': resolve(__dirname, 'src/shared'),
        '@components': resolve(__dirname, 'src/shared/components'),
        '@services': resolve(__dirname, 'src/shared/services'),
        '@types': resolve(__dirname, 'src/shared/types'),
        '@utils': resolve(__dirname, 'src/shared/utils'),
      },
    },
    server: {
      port: getPortForApp(app),
      proxy: {
        '/api': 'http://localhost:4001',
        '/graphql': 'http://localhost:4001',
      },
    },
  }
})

function getPortForApp(app: string): number {
  const ports = {
    main: 3000,
    reader: 3001,
    admin: 3002,
    embed: 3003,
  }
  return ports[app] || 3000
}
```

### **3. Shared API Client Architecture**

```typescript
// packages/shared/api-client/src/omnivore-client.ts
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

export interface OmnivoreClientConfig {
  baseUrl: string
  platform: 'web' | 'mobile' | 'extension'
  authToken?: string
}

export class OmnivoreClient {
  private apolloClient: ApolloClient<any>

  constructor(config: OmnivoreClientConfig) {
    const httpLink = createHttpLink({
      uri: `${config.baseUrl}/api/graphql`,
    })

    const authLink = setContext((_, { headers }) => {
      const token = config.authToken || this.getStoredToken()

      return {
        headers: {
          ...headers,
          'X-OmnivoreClient': config.platform,
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    })

    this.apolloClient = new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache({
        typePolicies: {
          // Platform-specific cache policies
          Query: {
            fields: {
              libraryItems: {
                merge: config.platform === 'mobile' ? false : true,
              },
            },
          },
        },
      }),
    })
  }

  // Platform-specific token storage
  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken')
    }
    return null
  }

  getApolloClient() {
    return this.apolloClient
  }
}

// Platform-specific implementations
export const createWebClient = (baseUrl: string) =>
  new OmnivoreClient({ baseUrl, platform: 'web' })

export const createMobileClient = (baseUrl: string, authToken: string) =>
  new OmnivoreClient({ baseUrl, platform: 'mobile', authToken })

export const createExtensionClient = (baseUrl: string) =>
  new OmnivoreClient({ baseUrl, platform: 'extension' })
```

### **4. Shared Component Library**

```typescript
// packages/shared/components/src/index.ts
export { Button } from './Button'
export { Input } from './Input'
export { Modal } from './Modal'
export { ArticleCard } from './ArticleCard'
export { LibraryGrid } from './LibraryGrid'
export { ReaderView } from './ReaderView'

// Platform-specific variants
export { MobileArticleCard } from './variants/MobileArticleCard'
export { WebArticleCard } from './variants/WebArticleCard'
export { ExtensionArticleCard } from './variants/ExtensionArticleCard'
```

```typescript
// packages/shared/components/src/ArticleCard/index.tsx
import React from 'react'
import { Article } from '@types/article'
import { WebArticleCard } from './variants/WebArticleCard'
import { MobileArticleCard } from './variants/MobileArticleCard'
import { ExtensionArticleCard } from './variants/ExtensionArticleCard'

interface ArticleCardProps {
  article: Article
  platform?: 'web' | 'mobile' | 'extension'
  variant?: 'default' | 'compact' | 'detailed'
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  platform = 'web',
  variant = 'default',
}) => {
  const Component = {
    web: WebArticleCard,
    mobile: MobileArticleCard,
    extension: ExtensionArticleCard,
  }[platform]

  return <Component article={article} variant={variant} />
}
```

### **5. State Management Architecture**

```typescript
// packages/shared/stores/src/auth-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setToken: (token: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const response = await fetch('/api/v2/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        const data = await response.json()
        if (data.success) {
          set({
            user: data.user,
            token: data.accessToken,
            isAuthenticated: true,
          })
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },

      setToken: (token: string) => {
        set({ token, isAuthenticated: !!token })
      },
    }),
    {
      name: 'omnivore-auth',
      // Platform-specific storage
      storage: typeof window !== 'undefined' ? localStorage : undefined,
    }
  )
)
```

---

## 🔄 Migration Strategy

### **Phase 1: Foundation (Week 1)**

```bash
# Day 1-2: Setup
mkdir packages/web-vite
cd packages/web-vite
npm create vite@latest . -- --template react-ts

# Install shared dependencies
npm install @tanstack/react-query @apollo/client zustand
npm install @radix-ui/react-* @stitches/react

# Day 3-4: Core Architecture
# - Set up shared package structure
# - Create API client
# - Implement auth store
# - Create basic routing
```

### **Phase 2: App Migration (Week 2)**

```bash
# Day 1-3: Main App Migration
# - Migrate authentication pages
# - Migrate library management
# - Migrate article reading

# Day 4-5: Additional Apps
# - Create standalone reader app
# - Create admin interface
# - Create embed widgets
```

### **Phase 3: Optimization (Week 3)**

```bash
# Day 1-2: Performance
# - Bundle optimization
# - Code splitting
# - Lazy loading

# Day 3-5: Testing & Deployment
# - Unit tests
# - E2E tests
# - Production deployment
```

---

## 🌐 Multi-App Deployment Strategy

### **1. Development Environment**

```yaml
# docker-compose.dev.yml
services:
  web-vite-main:
    build: ./packages/web-vite
    ports: ['3000:3000']
    environment:
      - VITE_APP=main
      - VITE_API_URL=http://localhost:4001
    command: npm run dev:main

  web-vite-reader:
    build: ./packages/web-vite
    ports: ['3001:3001']
    environment:
      - VITE_APP=reader
      - VITE_API_URL=http://localhost:4001
    command: npm run dev:reader

  web-vite-admin:
    build: ./packages/web-vite
    ports: ['3002:3002']
    environment:
      - VITE_APP=admin
      - VITE_API_URL=http://localhost:4001
    command: npm run dev:admin
```

### **2. Production Deployment**

```typescript
// nginx.conf
server {
    listen 80;
    server_name omnivore.app;

    # Main app
    location / {
        root /var/www/omnivore/main;
        try_files $uri $uri/ /index.html;
    }

    # Reader app
    location /reader {
        root /var/www/omnivore/reader;
        try_files $uri $uri/ /index.html;
    }

    # Admin app
    location /admin {
        root /var/www/omnivore/admin;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://api-nest:4001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 📱 Cross-Platform Compatibility

### **1. Shared API Client Usage**

```typescript
// Web App
import { createWebClient } from '@shared/api-client'
const client = createWebClient('https://api.omnivore.app')

// Mobile App (React Native)
import { createMobileClient } from '@shared/api-client'
const client = createMobileClient('https://api.omnivore.app', authToken)

// Extension
import { createExtensionClient } from '@shared/api-client'
const client = createExtensionClient('https://api.omnivore.app')
```

### **2. Component Reuse**

```typescript
// Shared components work across platforms
import { ArticleCard, Button, Modal } from '@shared/components'

// Platform-specific rendering
;<ArticleCard article={article} platform="web" variant="detailed" />
```

### **3. State Synchronization**

```typescript
// Shared state stores work across web apps
import { useAuthStore, useLibraryStore } from '@shared/stores'

// All web apps share the same auth state
const { user, isAuthenticated } = useAuthStore()
```

---

## 🚀 Future Micro-Frontend Evolution

### **Phase 1: Modular Apps (Current)**

- Multiple Vite apps sharing components
- Shared API client and state management
- Independent deployment per app

### **Phase 2: Module Federation (Future)**

```typescript
// webpack.config.js
const ModuleFederationPlugin = require('@module-federation/webpack')

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'omnivore_shell',
      remotes: {
        auth: 'auth@http://localhost:3001/remoteEntry.js',
        library: 'library@http://localhost:3002/remoteEntry.js',
        reader: 'reader@http://localhost:3003/remoteEntry.js',
      },
      shared: {
        react: { singleton: true },
        '@tanstack/react-query': { singleton: true },
      },
    }),
  ],
}
```

### **Phase 3: Full Micro-Frontends (Long-term)**

- Independent teams per micro-frontend
- Technology flexibility (React, Vue, Angular)
- Independent deployment and scaling

---

## 📊 Benefits of This Architecture

### **Immediate Benefits**

- ✅ **50-100x faster development** (Vite vs Next.js)
- ✅ **Modular apps** (main, reader, admin, embed)
- ✅ **Shared components** across web interfaces
- ✅ **Consistent API client** across platforms
- ✅ **Independent deployment** per app

### **Scalability Benefits**

- ✅ **Team autonomy** (different teams can own different apps)
- ✅ **Technology flexibility** (can mix React, Vue, Angular)
- ✅ **Independent scaling** (scale reader separately from main app)
- ✅ **Micro-frontend ready** (easy migration path)

### **Cross-Platform Benefits**

- ✅ **Shared code** between web, mobile, extension
- ✅ **Consistent UX** across all platforms
- ✅ **Unified API client** with platform-specific optimizations
- ✅ **State synchronization** across web apps

---

## 🎯 Implementation Priority

### **Week 1: Foundation**

1. Set up Vite with multi-app configuration
2. Create shared API client
3. Implement auth store and routing
4. Migrate authentication pages

### **Week 2: Core Apps**

1. Migrate main web app (library management)
2. Create standalone reader app
3. Create admin interface
4. Implement shared components

### **Week 3: Polish & Deploy**

1. Performance optimization
2. Testing and quality assurance
3. Production deployment
4. Documentation and handoff

**This architecture provides immediate performance gains while establishing a scalable foundation for future growth and team expansion.**
