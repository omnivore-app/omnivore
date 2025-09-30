workspace "Omnivore Platform" "System Context and Architecture for Omnivore - A read-it-later application" {

  !identifiers hierarchical

  model {
    webUser        = person "Reader (Web)"            "Uses the web app to save and read content"
    mobileUser     = person "Reader (Mobile)"         "Uses native apps"
    browserClipper = person "Browser Clipper User"    "Saves content via browser extension"
    emailSender    = person "Email/Newsletter Sender" "Forwards newsletters to Omnivore"
    automationUser = person "Integration Developer"   "Builds automations/webhooks"
    supportUser    = person "Support & Ops"           "Operates the platform"

    omnivore = softwareSystem "Omnivore Platform" "Enables content saving, reading, and annotation" {
      api              = container "API"              "Node.js (Express + Apollo GraphQL)" "Handles GraphQL, REST, auth, orchestration" {
        url "http://localhost:4000/graphql"

        // Current Express-based REST routers
        authRouter = component "Auth Router" "Express.js" "Authentication endpoints and JWT handling" {
          url "https://github.com/omnivore-app/omnivore/tree/main/packages/api/src/routers/auth_router.ts"
          properties {
            "Implementation" "auth_router.ts, mobile_auth_router.ts"
            "Endpoints" "/auth/*, /mobile-auth/*"
            "Responsibilities" "Login, logout, JWT issuance, OAuth flows"
          }
        }

        articleRouter = component "Article Router" "Express.js" "Content saving and article management" {
          url "https://github.com/omnivore-app/omnivore/tree/main/packages/api/src/routers/article_router.ts"
          properties {
            "Implementation" "article_router.ts"
            "Endpoints" "/article/*, content save endpoints"
            "Responsibilities" "Article CRUD, content saving, URL processing"
          }
        }

        digestRouter = component "Digest Router" "Express.js" "Email digest management" {
          url "https://github.com/omnivore-app/omnivore/tree/main/packages/api/src/routers/digest_router.ts"
          properties {
            "Implementation" "digest_router.ts"
            "Endpoints" "/digest/*"
            "Responsibilities" "Digest scheduling, email preferences"
          }
        }

        integrationRouter = component "Integration Router" "Express.js" "Third-party integrations and webhooks" {
          url "https://github.com/omnivore-app/omnivore/tree/main/packages/api/src/routers/integration_router.ts"
          properties {
            "Implementation" "integration_router.ts"
            "Endpoints" "/integration/*"
            "Responsibilities" "Webhook management, third-party connectors"
          }
        }

        notificationRouter = component "Notification Router" "Express.js" "Push and email notifications" {
          url "https://github.com/omnivore-app/omnivore/tree/main/packages/api/src/routers/notification_router.ts"
          properties {
            "Implementation" "notification_router.ts"
            "Endpoints" "/notifications/*"
            "Responsibilities" "Notification preferences, delivery status"
          }
        }

        userRouter = component "User Router" "Express.js" "User profile and settings management" {
          url "https://github.com/omnivore-app/omnivore/tree/main/packages/api/src/routers/user_router.ts"
          properties {
            "Implementation" "user_router.ts"
            "Endpoints" "/users/*"
            "Responsibilities" "User CRUD, settings, profile management"
          }
        }

        graphqlResolvers = component "GraphQL Resolvers" "Apollo GraphQL" "GraphQL schema resolvers and type definitions" {
          url "https://github.com/omnivore-app/omnivore/tree/main/packages/api/src/graphql"
          properties {
            "Implementation" "GraphQL resolvers, schema definitions"
            "Schema Location" "packages/api/src/graphql/schema"
            "Responsibilities" "GraphQL query/mutation resolution, type federation"
          }
        }

        serviceLayer = component "Service Layer" "TypeScript Functions" "Business logic and domain services" {
          url "https://github.com/omnivore-app/omnivore/tree/main/packages/api/src/services"
          properties {
            "Implementation" "Plain functions with business logic"
            "Examples" "createPageSaveRequest.ts, applyRulesToLibraryItem.ts"
            "Pattern" "Shared functions called by routers and resolvers"
          }
        }

        dataAccess = component "Data Access Layer" "TypeORM + PostgreSQL" "Repositories and database gateways" {
          url "https://github.com/omnivore-app/omnivore/tree/main/packages/api/src/repositories"
          properties {
            "Technology" "TypeORM entities, repositories"
            "Database" "PostgreSQL with Row Level Security"
            "Migrations" "packages/db/migrations/"
          }
        }

        queueProducers = component "Queue Producers" "BullMQ + Redis" "Job scheduling and queue management" {
          url "https://github.com/omnivore-app/omnivore/tree/main/packages/api/src/queues"
          properties {
            "Queues" "content, digest, notification, rule, integration"
            "Technology" "BullMQ with Redis backend"
          }
        }

        externalClients = component "External Service Clients" "TypeScript SDKs" "Third-party service integrations" {
          url "https://github.com/omnivore-app/omnivore/tree/main/packages/api/src/clients"
          properties {
            "Services" "Intercom, Elasticsearch, OAuth providers, SendGrid"
            "Pattern" "SDK wrappers with error handling"
          }
        }

        // Current Express router and GraphQL resolver interactions
        authRouter -> serviceLayer "Authentication business logic" "in-process"
        authRouter -> dataAccess "User authentication queries" "TypeORM"
        authRouter -> externalClients "OAuth provider validation" "SDK"
        
        articleRouter -> serviceLayer "Article processing logic" "in-process"
        articleRouter -> dataAccess "Article CRUD operations" "TypeORM"
        articleRouter -> queueProducers "Queue content processing jobs" "BullMQ"
        
        digestRouter -> serviceLayer "Digest generation logic" "in-process"
        digestRouter -> dataAccess "User digest preferences" "TypeORM"
        digestRouter -> queueProducers "Schedule digest jobs" "BullMQ"
        
        integrationRouter -> serviceLayer "Integration business logic" "in-process"
        integrationRouter -> dataAccess "Integration settings" "TypeORM"
        integrationRouter -> queueProducers "Queue integration tasks" "BullMQ"
        integrationRouter -> externalClients "Webhook delivery" "HTTP"
        
        notificationRouter -> serviceLayer "Notification logic" "in-process"
        notificationRouter -> dataAccess "Notification preferences" "TypeORM"
        notificationRouter -> queueProducers "Queue notification jobs" "BullMQ"
        
        userRouter -> serviceLayer "User management logic" "in-process"
        userRouter -> dataAccess "User profile data" "TypeORM"
        
        graphqlResolvers -> serviceLayer "Business logic delegation" "in-process"
        graphqlResolvers -> dataAccess "GraphQL data resolution" "TypeORM"
        graphqlResolvers -> queueProducers "Background job scheduling" "BullMQ"
        graphqlResolvers -> externalClients "External service calls" "SDK"
        
        serviceLayer -> dataAccess "Domain data operations" "TypeORM"
        serviceLayer -> queueProducers "Background job scheduling" "BullMQ"
        serviceLayer -> externalClients "External API calls" "SDK"
      }

      webApp           = container "Web Client"       "Next.js"                            "Browser UI" {
        url "http://localhost:3000"
      }
      mobileApps       = container "Mobile Clients"   "iOS (SwiftUI) & Android (Compose)"  "Mobile UI"
      browserExtension = container "Browser Extension""JavaScript"                         "Capture content into Omnivore"
      workers          = container "Queue Processor"    "Node.js + BullMQ"                  "Process queued jobs for content, digests, notifications" {
        url "https://github.com/omnivore-app/omnivore/tree/main/packages/queue-processor"
        properties {
          "Queue System" "BullMQ with Redis"
          "Worker Types" "Content, Digest, Email, Rule, Integration, AI"
          "Scaling" "Horizontal via Docker"
        }

        contentIngestionWorkers = component "Content Ingestion Workers" "Node.js" "Process saved articles (fetch, parse, enrich)" {
          url "https://github.com/omnivore-app/omnivore/tree/main/packages/queue-processor/src/content"
          properties {
            "Related Packages" "Uses unified content processing from API package"
            "Implementation" "packages/api/src/content/"
          }
        }

        digestWorkers = component "Digest Workers" "Node.js" "Assemble and deliver email digests" {
          url "https://github.com/omnivore-app/omnivore/tree/main/packages/queue-processor/src/digest"
        }

        notificationWorkers = component "Notification Workers" "Node.js" "Send push/email notifications" {
          url "https://github.com/omnivore-app/omnivore/tree/main/packages/queue-processor/src/notification"
        }

        ruleWorkers = component "Rule Automation Workers" "Node.js" "Apply saved rules to new content" {
          url "https://github.com/omnivore-app/omnivore/tree/main/packages/rule-handler"
        }

        integrationWorkers = component "Integration Workers" "Node.js" "Handle inbound/outbound integrations" {
          url "https://github.com/omnivore-app/omnivore/tree/main/packages/integration-handler"
          properties {
            "Also Uses" "packages/imap-mail-watcher, packages/inbound-email-handler"
          }
        }

        aiAssistWorkers = component "AI Assist Workers" "Node.js" "Summaries and AI-powered features" {
          url "https://github.com/omnivore-app/omnivore/tree/main/packages/queue-processor/src/ai"
        }

      }

      contentWorker    = container "Content Worker"      "Node.js + Puppeteer"               "Dedicated content fetching and parsing" {
        url "https://github.com/omnivore-app/omnivore/tree/main/packages/content-handler"
        properties {
          "Technology" "Puppeteer Extra, custom services"
          "Scaling" "Horizontal scaling challenges due to API coupling"
          "Status" "Being consolidated into API unified content processing"
        }
      }

      imageProxy       = container "Image Proxy"         "Express.js"                        "Image resizing and caching service" {
        url "https://github.com/omnivore-app/omnivore/tree/main/packages/image-proxy"
        properties {
          "Technology" "Express server with image processing"
          "Status" "Independent container, minimal documentation"
        }
      }

      mlServices       = container "ML/AI Services"      "FastAPI/Node.js"                   "AI summaries and ML-powered features" {
        properties {
          "Technology" "Mixed FastAPI/Node implementations"
          "Status" "Mixed maturity, some endpoints mocked"
          "Location" "ml/ directory"
        }
      }

      db = container "PostgreSQL" "PostgreSQL" "Primary datastore" {
        tags "Database"
        url "http://localhost:5432"
        properties {
          "Schema Location" "packages/db/"
          "Migrations" "TypeORM migrations"
          "Port" "5432"
        }
      }
      cache = container "Redis" "Redis" "Queues & cache" {
        tags "Database"
        url "http://localhost:6379"
        properties {
          "Usage" "Caching and BullMQ queues"
          "Port" "6379"
          "Persistence" "RDB + AOF"
        }
      }
      objectStorage = container "Object Storage" "GCS / MinIO (S3 API)" "Stores uploads and assets" {
        tags "Storage"
        url "http://localhost:9000"
        properties {
          "Type" "S3-compatible storage"
          "Console" "http://localhost:9001"
          "API" "S3 REST API"
        }
      }
    }

    externalContent = softwareSystem "External Content Sources" "Web, RSS, YouTube, PDF, Email"
    sendGrid        = softwareSystem "SendGrid"                 "Transactional Email"
    gAuth           = softwareSystem "Google OAuth"             "Authentication"
    appleAuth       = softwareSystem "Apple Sign-In"            "Authentication"
    openAI          = softwareSystem "OpenAI"                   "AI summarization/explain"
    anthropic       = softwareSystem "Anthropic Claude"         "AI summarization"
    elasticsearch   = softwareSystem "Elasticsearch"            "Full-text indexing/search"
    intercom        = softwareSystem "Intercom"                 "Customer engagement"

    // User interactions
    webUser        -> omnivore.webApp           "Uses"                                  "HTTPS"
    mobileUser     -> omnivore.mobileApps       "Uses"                                  "HTTPS"
    browserClipper -> omnivore.browserExtension "Uses"                                  "HTTPS"
    emailSender    -> omnivore.api              "Forwards newsletters for ingestion"    "SMTP/HTTPS"
    automationUser -> omnivore.api              "Calls integrations & webhooks"         "HTTPS"
    supportUser    -> omnivore.api              "Administers via internal tools"        "HTTPS"

    // Internal container relationships
    omnivore.webApp           -> omnivore.api           "Reads/writes data via GraphQL/REST"
    omnivore.mobileApps       -> omnivore.api           "Reads/writes data via GraphQL/REST"
    omnivore.browserExtension -> omnivore.api           "Creates saves via REST"
    omnivore.api              -> omnivore.db            "Persists domain data"
    omnivore.api              -> omnivore.cache         "Manages sessions & queues"
    omnivore.api              -> omnivore.objectStorage "Stores files & images"
    omnivore.api              -> omnivore.workers       "Queues background tasks"

    omnivore.workers -> omnivore.db            "Updates processed content"
    omnivore.workers -> omnivore.cache         "Processes job queues"
    omnivore.workers -> omnivore.objectStorage "Processes media files"
    omnivore.contentWorker -> omnivore.db      "Updates content processing status"
    omnivore.contentWorker -> omnivore.cache   "Manages processing queues"
    omnivore.imageProxy -> omnivore.objectStorage "Caches processed images"
    omnivore.mlServices -> omnivore.api        "Provides AI processing results"

    // External integrations
    omnivore.workers -> externalContent "Fetches content"        "HTTP"
    omnivore.workers -> sendGrid        "Sends notifications"    "SMTP"
    omnivore.api     -> gAuth           "Validates user sessions" "OAuth"
    omnivore.api     -> appleAuth       "Validates user sessions" "OAuth"
    omnivore.workers -> openAI          "AI content processing"  "HTTPS"
    omnivore.workers -> anthropic       "AI content processing"  "HTTPS"
    omnivore.api     -> elasticsearch   "Indexes & searches content" "HTTPS"
    omnivore.api     -> intercom        "Customer support integration" "HTTPS"

    // Component to infrastructure relationships
    omnivore.api.dataAccess            -> omnivore.db            "Persist domain entities"        "SQL"
    omnivore.api.authRouter             -> omnivore.cache         "Manage user sessions"           "Redis"
    omnivore.api.serviceLayer           -> omnivore.objectStorage "Store processed assets"        "S3 API"
    omnivore.api.queueProducers        -> omnivore.workers.contentIngestionWorkers "Dispatch ingest jobs"        "BullMQ"
    omnivore.api.queueProducers        -> omnivore.workers.digestWorkers          "Dispatch digest jobs"        "BullMQ"
    omnivore.api.queueProducers        -> omnivore.workers.notificationWorkers    "Dispatch notification jobs" "BullMQ"
    omnivore.api.queueProducers        -> omnivore.workers.integrationWorkers     "Dispatch integration jobs"  "BullMQ"
    omnivore.api.externalClients       -> sendGrid               "Send transactional email"        "HTTPS"
    omnivore.api.externalClients       -> elasticsearch          "Index/search content"            "HTTPS"
    omnivore.api.externalClients       -> intercom               "Customer engagement"             "HTTPS"
    omnivore.api.externalClients       -> gAuth                  "Validate OAuth tokens"           "HTTPS"
    omnivore.api.externalClients       -> appleAuth              "Validate OAuth tokens"           "HTTPS"

    omnivore.workers.contentIngestionWorkers -> omnivore.db            "Update normalized content" "SQL"
    omnivore.workers.contentIngestionWorkers -> omnivore.cache         "Update job state"         "Redis"
    omnivore.workers.contentIngestionWorkers -> omnivore.objectStorage "Persist processed assets" "S3 API"
    omnivore.workers.contentIngestionWorkers -> externalContent        "Fetch article sources"     "HTTPS"
    omnivore.workers.digestWorkers          -> omnivore.db            "Read saved items"          "SQL"
    omnivore.workers.digestWorkers          -> sendGrid               "Send scheduled emails"     "SMTP"
    omnivore.workers.notificationWorkers    -> sendGrid               "Send transactional notifications" "HTTPS"
    omnivore.workers.notificationWorkers    -> omnivore.cache         "Track notification state"  "Redis"
    omnivore.workers.ruleWorkers            -> omnivore.db            "Evaluate rule criteria"    "SQL"
    omnivore.workers.integrationWorkers     -> automationUser         "Trigger webhooks"          "HTTPS"
    omnivore.workers.integrationWorkers     -> omnivore.api           "Notify API of integrations" "HTTPS"
    omnivore.workers.aiAssistWorkers        -> openAI                 "Summarize content"         "HTTPS"
    omnivore.workers.aiAssistWorkers        -> anthropic              "Summarize content"         "HTTPS"
  }

  views {
    systemContext omnivore "OmnivoreSystemContext" "System context diagram for Omnivore Platform" {
      include *
      autolayout lr
    }

    container omnivore "OmnivoreContainers" "Container diagram for Omnivore Platform" {
      include *
      autolayout tb
    }

    component omnivore.api "APIComponents" "Component diagram for Omnivore API" {
      include omnivore.api
      include omnivore.api.authRouter
      include omnivore.api.articleRouter
      include omnivore.api.digestRouter
      include omnivore.api.integrationRouter
      include omnivore.api.notificationRouter
      include omnivore.api.userRouter
      include omnivore.api.graphqlResolvers
      include omnivore.api.serviceLayer
      include omnivore.api.dataAccess
      include omnivore.api.queueProducers
      include omnivore.api.externalClients
      include omnivore.workers
      include omnivore.db
      include omnivore.cache
      include omnivore.objectStorage
      include sendGrid
      include elasticsearch
      include intercom
      include gAuth
      include appleAuth
      autolayout lr
    }

    component omnivore.workers "WorkerComponents" "Component diagram for background workers" {
      include omnivore.workers
      include omnivore.workers.contentIngestionWorkers
      include omnivore.workers.digestWorkers
      include omnivore.workers.notificationWorkers
      include omnivore.workers.ruleWorkers
      include omnivore.workers.integrationWorkers
      include omnivore.workers.aiAssistWorkers
      include omnivore.db
      include omnivore.cache
      include omnivore.objectStorage
      include externalContent
      include sendGrid
      include openAI
      include anthropic
      include omnivore.api
      autolayout lr
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
      }
      element "Storage" {
        shape folder
        background #2f7ed8
      }
      element "Component" {
        background #85bbf0
        color #0b233a
      }
    }
  }
}
