workspace "Omnivore NestJS Target Architecture" "Final architecture after NestJS migration - the North Star" {

  !identifiers hierarchical

  model {
    webUser        = person "Reader (Web)"            "Uses the web app to save and read content"
    mobileUser     = person "Reader (Mobile)"         "Uses native apps"
    browserClipper = person "Browser Clipper User"    "Saves content via browser extension"
    emailSender    = person "Email/Newsletter Sender" "Forwards newsletters to Omnivore"
    automationUser = person "Integration Developer"   "Builds automations/webhooks"
    supportUser    = person "Support & Ops"           "Operates the platform"

    omnivore = softwareSystem "Omnivore Platform" "Consolidated NestJS-based read-it-later application" {
      
      // Target NestJS API (Consolidated)
      nestApi = container "NestJS API" "Node.js NestJS + Apollo GraphQL + Integrated Queues" "Consolidated API with integrated background processing" {
        url "http://localhost:4000"
        properties {
          "Architecture" "Modular NestJS with dependency injection"
          "Queue Processing" "Integrated BullMQ processors"
          "Content Processing" "In-process content extraction and image optimization"
          "Services Replaced" "Replaces Express API, Queue Processor, Content Handler, Image Proxy"
        }

        // NestJS Modules (based on simplified-migration-backlog.md)
        appModule = component "App Module" "NestJS" "Application bootstrap and global configuration" {
          url "https://github.com/omnivore-app/omnivore/tree/main/packages/api-nest/src/app.module.ts"
          properties {
            "Slice" "ARC-S001: NestJS Foundation"
            "Responsibilities" "Global pipes, guards, interceptors, module orchestration"
          }
        }

        healthModule = component "Health Module" "NestJS + Terminus" "Health checks and observability" {
          url "https://github.com/omnivore-app/omnivore/tree/main/packages/api-nest/src/health"
          properties {
            "Slice" "ARC-S002: Health Checks & Observability"
            "Endpoints" "/api/health, /api/health/deep, /metrics"
            "Features" "Database/Redis health checks, Prometheus metrics"
          }
        }

        authModule = component "Auth Module" "NestJS + Passport + JWT" "Authentication with guards and strategies" {
          url "https://github.com/omnivore-app/omnivore/tree/main/packages/api-nest/src/auth"
          properties {
            "Slice" "ARC-S003: Core Authentication"
            "Features" "JWT, Google OAuth, Apple Sign-In, rate limiting"
            "Guards" "JwtAuthGuard for protected routes"
            "Replaces" "Express auth_router.ts, mobile_auth_router.ts"
          }
        }

        graphqlModule = component "GraphQL Module" "NestJS + Apollo GraphQL" "Unified GraphQL endpoint with resolvers" {
          url "https://github.com/omnivore-app/omnivore/tree/main/packages/api-nest/src/graphql"
          properties {
            "Slice" "ARC-S005: GraphQL Foundation"
            "Features" "Apollo Server, schema-first approach, authentication context"
            "Replaces" "Express GraphQL scattered resolvers"
          }
        }

        libraryModule = component "Library Module" "NestJS + TypeORM" "Article and content management" {
          url "https://github.com/omnivore-app/omnivore/tree/main/packages/api-nest/src/library"
          properties {
            "Slice" "ARC-S006: Library Management Core"
            "Features" "Article CRUD, search, labels, highlights"
            "GraphQL" "Library resolvers and mutations"
            "Replaces" "Express article_router.ts"
          }
        }

        queueModule = component "Queue Module" "NestJS + BullMQ" "Integrated background job processing" {
          url "https://github.com/omnivore-app/omnivore/tree/main/packages/api-nest/src/queue"
          properties {
            "Slice" "ARC-S007: Queue System Integration"
            "Features" "Content processing, image optimization, job monitoring"
            "Queues" "content-processing, image-processing"
            "Replaces" "Separate queue-processor service"
          }
        }

        contentModule = component "Content Module" "NestJS + Readability" "Content extraction and processing" {
          url "https://github.com/omnivore-app/omnivore/tree/main/packages/api-nest/src/content"
          properties {
            "Slice" "ARC-S008: Content Processing Integration"
            "Features" "Web article extraction, PDF processing, image optimization"
            "Processing" "In-process content extraction (no separate service)"
            "Replaces" "Separate content-handler service, image-proxy service"
          }
        }

        digestModule = component "Digest Module" "NestJS + Scheduler" "Email digest generation and scheduling" {
          url "https://github.com/omnivore-app/omnivore/tree/main/packages/api-nest/src/digest"
          properties {
            "Slice" "ARC-S009: Express API Migration"
            "Features" "Digest scheduling, email generation, user preferences"
            "Replaces" "Express digest_router.ts"
          }
        }

        integrationModule = component "Integration Module" "NestJS" "Webhooks and third-party integrations" {
          url "https://github.com/omnivore-app/omnivore/tree/main/packages/api-nest/src/integration"
          properties {
            "Slice" "ARC-S009: Express API Migration"
            "Features" "Webhook management, third-party connectors"
            "Replaces" "Express integration_router.ts"
          }
        }

        notificationModule = component "Notification Module" "NestJS" "Push and email notifications" {
          url "https://github.com/omnivore-app/omnivore/tree/main/packages/api-nest/src/notification"
          properties {
            "Slice" "ARC-S009: Express API Migration"
            "Features" "Push notifications, email notifications"
            "Replaces" "Express notification_router.ts"
          }
        }

        // Shared Infrastructure Components
        databaseModule = component "Database Module" "TypeORM + PostgreSQL" "Database connection and entities" {
          url "https://github.com/omnivore-app/omnivore/tree/main/packages/api-nest/src/database"
          properties {
            "Technology" "TypeORM with PostgreSQL"
            "Features" "Entity management, migrations, connection pooling"
            "Shared" "Used by all domain modules"
          }
        }

        configModule = component "Config Module" "NestJS Config" "Centralized configuration management" {
          url "https://github.com/omnivore-app/omnivore/tree/main/packages/api-nest/src/config"
          properties {
            "Features" "Environment validation, typed configuration"
            "Shared" "Used by all modules"
          }
        }

        // Module Relationships (Dependency Injection)
        appModule -> healthModule "Registers health module" "DI"
        appModule -> authModule "Registers auth module" "DI"
        appModule -> graphqlModule "Registers GraphQL module" "DI"
        appModule -> libraryModule "Registers library module" "DI"
        appModule -> queueModule "Registers queue module" "DI"
        appModule -> contentModule "Registers content module" "DI"
        appModule -> digestModule "Registers digest module" "DI"
        appModule -> integrationModule "Registers integration module" "DI"
        appModule -> notificationModule "Registers notification module" "DI"
        appModule -> databaseModule "Registers database module" "DI"
        appModule -> configModule "Registers config module" "DI"

        // Cross-module dependencies
        authModule -> databaseModule "User authentication" "DI"
        authModule -> configModule "JWT configuration" "DI"
        
        libraryModule -> authModule "Authentication guards" "DI"
        libraryModule -> databaseModule "Library data persistence" "DI"
        libraryModule -> queueModule "Queue content processing" "DI"
        
        graphqlModule -> authModule "GraphQL authentication context" "DI"
        graphqlModule -> libraryModule "Library resolvers" "DI"
        
        queueModule -> contentModule "Content processing jobs" "DI"
        queueModule -> databaseModule "Job result persistence" "DI"
        
        contentModule -> databaseModule "Content metadata storage" "DI"
        
        digestModule -> databaseModule "User preferences and content" "DI"
        digestModule -> queueModule "Schedule digest jobs" "DI"
        
        integrationModule -> databaseModule "Integration settings" "DI"
        integrationModule -> queueModule "Queue integration tasks" "DI"
        
        notificationModule -> databaseModule "Notification preferences" "DI"
        notificationModule -> queueModule "Queue notification jobs" "DI"

        healthModule -> databaseModule "Database health checks" "DI"
      }

      // Client Applications (unchanged)
      webApp = container "Web Client" "Next.js" "Browser UI" {
        url "http://localhost:3000"
        properties {
          "Technology" "Next.js with TypeScript"
          "API Communication" "GraphQL + REST to NestJS API"
        }
      }

      mobileApps = container "Mobile Clients" "iOS (SwiftUI) & Android (Compose)" "Mobile UI" {
        properties {
          "iOS" "SwiftUI with Swift Package Manager"
          "Android" "Jetpack Compose with Kotlin"
          "API Communication" "GraphQL + REST to NestJS API"
        }
      }

      browserExtension = container "Browser Extension" "JavaScript" "Content capture extension" {
        properties {
          "Technology" "Vanilla JavaScript"
          "API Communication" "REST endpoints to NestJS API"
        }
      }

      // Infrastructure (simplified)
      database = container "PostgreSQL" "PostgreSQL 15+" "Primary datastore" {
        tags "Database"
        url "http://localhost:5432"
        properties {
          "Schema Location" "packages/db/"
          "Migrations" "TypeORM migrations"
          "Features" "Full-text search, JSON support, row-level security"
        }
      }

      cache = container "Redis" "Redis 7+" "Cache and job queues" {
        tags "Database"
        url "http://localhost:6379"
        properties {
          "Usage" "BullMQ job queues, session cache, application cache"
          "Persistence" "RDB + AOF for job queue reliability"
        }
      }

      objectStorage = container "Object Storage" "MinIO (S3-compatible)" "File and image storage" {
        tags "Storage"
        url "http://localhost:9000"
        properties {
          "Type" "S3-compatible object storage"
          "Content" "Processed images, file uploads, PDF files"
        }
      }
    }

    // External Systems
    externalContent = softwareSystem "External Content Sources" "Web articles, RSS feeds, YouTube, PDFs"
    sendGrid = softwareSystem "SendGrid" "Transactional email service"
    googleAuth = softwareSystem "Google OAuth" "Google authentication provider"
    appleAuth = softwareSystem "Apple Sign-In" "Apple authentication provider"
    openAI = softwareSystem "OpenAI" "AI content summarization"
    anthropic = softwareSystem "Anthropic Claude" "AI content analysis"
    elasticsearch = softwareSystem "Elasticsearch" "Full-text search indexing (optional)"

    // User Interactions
    webUser -> omnivore.webApp "Uses web interface" "HTTPS"
    mobileUser -> omnivore.mobileApps "Uses mobile apps" "HTTPS"
    browserClipper -> omnivore.browserExtension "Saves content" "HTTPS"
    emailSender -> omnivore.nestApi "Forwards newsletters" "SMTP/HTTPS"
    automationUser -> omnivore.nestApi "API integrations" "HTTPS"
    supportUser -> omnivore.nestApi "Administrative access" "HTTPS"

    // Client to API
    omnivore.webApp -> omnivore.nestApi "GraphQL queries and mutations" "HTTPS"
    omnivore.mobileApps -> omnivore.nestApi "GraphQL and REST API calls" "HTTPS"
    omnivore.browserExtension -> omnivore.nestApi "Content save requests" "HTTPS"

    // API to Infrastructure
    omnivore.nestApi -> omnivore.database "Data persistence and queries" "TCP/SQL"
    omnivore.nestApi -> omnivore.cache "Job queues and caching" "TCP/Redis"
    omnivore.nestApi -> omnivore.objectStorage "File storage and retrieval" "HTTP/S3"

    // External Integrations
    omnivore.nestApi -> externalContent "Content fetching and processing" "HTTPS"
    omnivore.nestApi -> sendGrid "Email delivery" "HTTPS"
    omnivore.nestApi -> googleAuth "OAuth authentication" "HTTPS"
    omnivore.nestApi -> appleAuth "OAuth authentication" "HTTPS"
    omnivore.nestApi -> openAI "AI content processing" "HTTPS"
    omnivore.nestApi -> anthropic "AI content analysis" "HTTPS"
    omnivore.nestApi -> elasticsearch "Content indexing" "HTTPS"

    // Component-level relationships
    omnivore.nestApi.authModule -> googleAuth "Google OAuth flow" "HTTPS"
    omnivore.nestApi.authModule -> appleAuth "Apple Sign-In flow" "HTTPS"
    omnivore.nestApi.contentModule -> externalContent "Content extraction" "HTTPS"
    omnivore.nestApi.digestModule -> sendGrid "Digest email delivery" "HTTPS"
    omnivore.nestApi.notificationModule -> sendGrid "Notification emails" "HTTPS"
    omnivore.nestApi.queueModule -> openAI "AI processing jobs" "HTTPS"
    omnivore.nestApi.queueModule -> anthropic "AI analysis jobs" "HTTPS"
  }

  views {
    systemContext omnivore "OmnivoreSystemContext" "System context showing Omnivore after NestJS migration" {
      include *
      autolayout lr
      title "Omnivore System Context - Post NestJS Migration"
      description "Simplified architecture with consolidated NestJS API"
    }

    container omnivore "OmnivoreContainers" "Container view showing simplified architecture" {
      include *
      autolayout tb
      title "Omnivore Container Architecture - Target State"
      description "Consolidated NestJS API with integrated background processing"
    }

    component omnivore.nestApi "NestJSModules" "NestJS module architecture showing internal structure" {
      include omnivore.nestApi
      include omnivore.nestApi.appModule
      include omnivore.nestApi.healthModule
      include omnivore.nestApi.authModule
      include omnivore.nestApi.graphqlModule
      include omnivore.nestApi.libraryModule
      include omnivore.nestApi.queueModule
      include omnivore.nestApi.contentModule
      include omnivore.nestApi.digestModule
      include omnivore.nestApi.integrationModule
      include omnivore.nestApi.notificationModule
      include omnivore.nestApi.databaseModule
      include omnivore.nestApi.configModule
      include omnivore.database
      include omnivore.cache
      include omnivore.objectStorage
      include sendGrid
      include googleAuth
      include appleAuth
      include openAI
      include anthropic
      include externalContent
      autolayout tb
      title "NestJS API Internal Architecture"
      description "Modular NestJS architecture with dependency injection"
    }

    dynamic omnivore "ContentSaveFlow" "How content saving works in the target architecture" {
      title "Content Save Flow - Target Architecture"
      
      webUser -> omnivore.webApp "1. Save article URL"
      omnivore.webApp -> omnivore.nestApi "2. GraphQL saveArticle mutation"
      omnivore.nestApi -> omnivore.database "3. Create library item"
      omnivore.nestApi -> omnivore.cache "4. Queue content processing job"
      omnivore.nestApi -> externalContent "5. Fetch article content (background)"
      omnivore.nestApi -> omnivore.objectStorage "6. Store processed images"
      omnivore.nestApi -> omnivore.database "7. Update with processed content"
      omnivore.nestApi -> omnivore.webApp "8. Return saved article"
      
      autolayout tb
    }

    dynamic omnivore "AuthenticationFlow" "Authentication flow in target architecture" {
      title "Authentication Flow - Target Architecture"
      
      webUser -> omnivore.webApp "1. Login request"
      omnivore.webApp -> omnivore.nestApi "2. Authentication request"
      omnivore.nestApi -> omnivore.database "3. Validate user credentials"
      omnivore.nestApi -> googleAuth "4. OAuth validation (if Google)"
      omnivore.nestApi -> omnivore.cache "5. Store session data"
      omnivore.nestApi -> omnivore.webApp "6. Return JWT token"
      omnivore.webApp -> omnivore.nestApi "7. Authenticated GraphQL request"
      omnivore.nestApi -> omnivore.cache "8. Validate JWT session"
      
      autolayout tb
    }

    styles {
      element "Person" {
        background #08427b
        color #ffffff
        shape person
      }
      element "Software System" {
        background #1168bd
        color #ffffff
      }
      element "Container" {
        background #438dd5
        color #ffffff
      }
      element "Database" {
        shape cylinder
        background #2f7ed8
        color #ffffff
      }
      element "Storage" {
        shape folder
        background #2f7ed8
        color #ffffff
      }
      element "Component" {
        background #85bbf0
        color #0b233a
      }
      element "Legacy" {
        background #ff6b35
        color #ffffff
      }
    }
  }
}
