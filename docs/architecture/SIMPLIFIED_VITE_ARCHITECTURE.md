# 🎯 Simplified Vite Architecture: Essential Simplicity

## 📊 Current State Analysis

### **Current API Client Patterns**

```typescript
// Current: Mixed approaches across the app
// 1. TanStack Query + GraphQL Request
const { data } = useQuery({
  queryKey: ['subscriptions'],
  queryFn: async () => {
    const response = await gqlFetcher(GQL_GET_SUBSCRIPTIONS, variables)
    return response.subscriptions.subscriptions
  },
})

// 2. SWR + GraphQL Request
const { data, error, mutate } = useSWR(
  [query, variables],
  makeGqlFetcher(query, variables),
  {}
)

// 3. Custom hooks with localStorage persistence
const [currentTheme, setCurrentTheme] = usePersistedState({
  key: 'theme',
  initialValue: 'Light',
})
```

### **Current State Management**

- **TanStack Query**: For server state (caching, background refetch)
- **SWR**: For some queries (inconsistent pattern)
- **usePersistedState**: For client state with localStorage
- **React Context**: For theme and global state
- **localStorage**: Direct access for auth tokens

### **Current Routing**

- **Next.js App Router**: File-based routing
- **No admin routes**: Currently no dedicated admin interface
- **Protected routes**: Handled via `useGetViewer` hook

---

## 🚀 Simplified Vite Architecture

### **Single App, Single Port (3000)**

```
packages/web-vite/
├── src/
│   ├── components/          # All components
│   │   ├── auth/           # Auth components
│   │   ├── library/        # Library components
│   │   ├── reader/         # Reader components
│   │   ├── settings/       # Settings components
│   │   └── admin/          # Admin components (protected)
│   ├── hooks/              # Custom hooks
│   │   ├── useAuth.ts      # Auth state & actions
│   │   ├── useTheme.ts     # Theme management
│   │   └── useLibrary.ts   # Library operations
│   ├── services/           # API services
│   │   ├── api-client.ts   # Unified GraphQL client
│   │   ├── auth-service.ts # Auth operations
│   │   └── library-service.ts # Library operations
│   ├── stores/             # Global state
│   │   ├── auth-store.ts   # Auth state (Zustand)
│   │   └── theme-store.ts  # Theme state (Zustand)
│   ├── pages/              # Route components
│   │   ├── LoginPage.tsx
│   │   ├── LibraryPage.tsx
│   │   ├── ReaderPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── AdminPage.tsx   # Protected admin route
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── vite.config.ts
└── package.json
```

### **Unified API Client**

```typescript
// src/services/api-client.ts
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

class OmnivoreApiClient {
  private apolloClient: ApolloClient<any>

  constructor() {
    const httpLink = createHttpLink({
      uri: `${import.meta.env.VITE_API_URL}/api/graphql`,
    })

    const authLink = setContext((_, { headers }) => {
      const token = localStorage.getItem('authToken')

      return {
        headers: {
          ...headers,
          'X-OmnivoreClient': 'web',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    })

    this.apolloClient = new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache({
        typePolicies: {
          Query: {
            fields: {
              libraryItems: {
                merge: false, // Replace instead of merge for pagination
              },
            },
          },
        },
      }),
    })
  }

  getApolloClient() {
    return this.apolloClient
  }

  // REST API methods
  async login(email: string, password: string) {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/v2/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }
    )
    return response.json()
  }
}

export const apiClient = new OmnivoreApiClient()
```

### **Simplified State Management**

```typescript
// src/stores/auth-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const data = await apiClient.login(email, password)
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
        localStorage.removeItem('authToken')
      },
    }),
    {
      name: 'omnivore-auth',
      storage: localStorage,
    }
  )
)
```

### **Protected Admin Route**

```typescript
// src/components/AdminPage.tsx
import { useAuthStore } from '../stores/auth-store'
import { Navigate } from 'react-router-dom'

export function AdminPage() {
  const { user, isAuthenticated } = useAuthStore()

  // Simple role-based protection
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/library" replace />
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {/* Admin content */}
    </div>
  )
}
```

### **React Router Setup**

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApolloProvider } from '@apollo/client'
import { useAuthStore } from './stores/auth-store'
import { LoginPage } from './pages/LoginPage'
import { LibraryPage } from './pages/LibraryPage'
import { ReaderPage } from './pages/ReaderPage'
import { SettingsPage } from './pages/SettingsPage'
import { AdminPage } from './pages/AdminPage'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ApolloProvider client={apiClient.getApolloClient()}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/reader/:id" element={<ReaderPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/" element={<Navigate to="/library" replace />} />
          </Routes>
        </BrowserRouter>
      </ApolloProvider>
    </QueryClientProvider>
  )
}

export default App
```

---

## 🔄 Migration Strategy: Keep It Simple

### **Phase 1: Foundation (Week 1)**

```bash
# Day 1-2: Setup
mkdir packages/web-vite
cd packages/web-vite
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install @tanstack/react-query @apollo/client zustand react-router-dom
npm install @radix-ui/react-* @stitches/react

# Day 3-4: Core Services
# - Create unified API client
# - Set up auth store
# - Create basic routing
```

### **Phase 2: Feature Migration (Week 2)**

```bash
# Day 1-3: Core Features
# - Migrate authentication
# - Migrate library management
# - Migrate article reading

# Day 4-5: Additional Features
# - Migrate settings
# - Add admin interface (if needed)
# - Migrate theme management
```

### **Phase 3: Polish (Week 3)**

```bash
# Day 1-2: Performance
# - Bundle optimization
# - Code splitting
# - Lazy loading

# Day 3-5: Testing & Deploy
# - Unit tests
# - E2E tests
# - Production deployment
```

---

## 🎯 Why Single App Architecture?

### **Arguments FOR Single App**

- ✅ **Simpler deployment**: One build, one deploy
- ✅ **Shared state**: All components share the same stores
- ✅ **Consistent routing**: Single router configuration
- ✅ **Easier development**: No context switching between apps
- ✅ **Current pattern**: Matches existing Next.js structure

### **Arguments AGAINST Multiple Apps**

- ❌ **Complexity**: Multiple builds, deployments, configurations
- ❌ **State sharing**: Harder to share state between apps
- ❌ **Development overhead**: Multiple dev servers, ports
- ❌ **No clear benefit**: Admin is just a protected route

### **Admin Interface: Protected Route**

```typescript
// Current: No admin interface exists
// Proposed: Simple protected route at /admin

// Benefits:
// - Same codebase, same deployment
// - Shared components and state
// - Simple role-based access control
// - Easy to maintain and extend
```

---

## 📊 Simplified Benefits

### **Immediate Benefits**

- ✅ **50-100x faster development** (Vite vs Next.js)
- ✅ **Unified API client** (no more mixed SWR/Query patterns)
- ✅ **Consistent state management** (Zustand + TanStack Query)
- ✅ **Simple routing** (React Router)
- ✅ **Single deployment** (one build, one app)

### **Development Benefits**

- ✅ **Easier debugging** (single app context)
- ✅ **Shared components** (no duplication)
- ✅ **Consistent patterns** (unified approach)
- ✅ **Faster iteration** (no context switching)

### **Maintenance Benefits**

- ✅ **Single codebase** (easier to maintain)
- ✅ **Unified testing** (single test suite)
- ✅ **Consistent deployment** (one pipeline)
- ✅ **Shared dependencies** (no version conflicts)

---

## 🚀 Implementation Plan

### **Week 1: Foundation**

1. Set up Vite with React Router
2. Create unified API client
3. Implement auth store with Zustand
4. Set up basic routing structure

### **Week 2: Core Migration**

1. Migrate authentication flow
2. Migrate library management
3. Migrate article reading
4. Add admin interface (if needed)

### **Week 3: Polish & Deploy**

1. Performance optimization
2. Testing and quality assurance
3. Production deployment
4. Documentation

**This simplified approach gives you all the performance benefits of Vite while maintaining the simplicity of a single application architecture.**
