---
alwaysApply: true
---
+# Omnivore Architecture Analysis and Consolidation Strategy
+
+## Current Architecture Overview
+
+Based on the codebase analysis, Omnivore currently consists of 25+ microservices:
+
+### Core Services
+- **web**: Next.js frontend application
+- **api**: GraphQL API server
+- **content-fetch**: Content fetching and processing service
+
+### Processing Services
+- **puppeteer-parse**: Browser-based content parsing
+- **pdf-handler**: PDF processing
+- **thumbnail-handler**: Image thumbnail generation
+- **readabilityjs**: Content readability extraction
+- **text-to-speech**: TTS functionality
+
+### Integration Services
+- **rss-handler**: RSS feed processing
+- **inbound-email-handler**: Email ingestion
+- **imap-mail-watcher**: IMAP email monitoring
+- **local-mail-watcher**: Local mail processing
+
+### Queue and Background Services
+- **queue-manager**: Job queue management
+- **export-handler**: Export functionality
+- **import-handler**: Import functionality
+- **integration-handler**: Third-party integrations
+- **rule-handler**: Rule processing
+
+### Infrastructure
+- PostgreSQL with pgvector
+- Redis for queuing and caching
+- MinIO/S3 for object storage
+- Nginx for reverse proxy
+
+## Consolidation Opportunities
+
+### 1. Content Processing Mega-Service
+Combine these services into a single "content-processor":
+- content-fetch
+- puppeteer-parse
+- pdf-handler
+- thumbnail-handler
+- readabilityjs
+
+**Benefits:**
+- Reduced inter-service communication
+- Shared resource pool for Chromium instances
+- Unified content pipeline
+- Single deployment unit
+
+### 2. Communication Services
+Merge email-related services:
+- inbound-email-handler
+- imap-mail-watcher
+- local-mail-watcher
+
+**Benefits:**
+- Simplified email configuration
+- Shared authentication logic
+- Reduced complexity for self-hosters
+
+### 3. Background Job Processor
+Consolidate queue processing:
+- queue-manager
+- export-handler
+- import-handler
+- integration-handler
+- rule-handler
+- rss-handler
+
+**Benefits:**
+- Single worker pool
+- Unified job scheduling
+- Better resource utilization
+
+## Proposed Simplified Architecture
+
+### Option 1: Three-Service Architecture
+1. **omnivore-web**: Frontend application
+2. **omnivore-api**: API + all background processing
+3. **omnivore-content**: All content processing services
+
+### Option 2: Monolithic with Optional Services
+1. **omnivore-core**: Everything in one service
+2. **omnivore-ai** (optional): AI/ML features
+3. **omnivore-email** (optional): Email processing
+
+### Option 3: Hybrid Approach (Recommended)
+1. **omnivore**: Main application (web + api + basic processing)
+2. **omnivore-worker**: Heavy processing (puppeteer, PDF, etc.)
+3. **omnivore-edge** (optional): CDN/proxy functionality
+
+## Implementation Strategy
+
+### Phase 1: Internal Consolidation (Weeks 1-2)
+- Move all handlers into the API service as modules
+- Use feature flags to enable/disable functionality
+- Maintain backward compatibility
+
+### Phase 2: Docker Optimization (Weeks 3-4)
+- Create multi-stage Dockerfile
+- Implement build-time feature selection
+- Optimize image sizes
+
+### Phase 3: Configuration System (Weeks 5-6)
+- Environment-based feature toggles
+- Self-hosted vs. cloud profiles
+- Plugin architecture for extensions
+
+### Phase 4: Testing and Migration (Weeks 7-8)
+- Comprehensive testing suite
+- Migration scripts
+- Documentation updates
+
+## Cost Optimization Strategies
+
+### For Self-Hosters
+- Single container deployment option
+- SQLite support for small installations
+- Built-in search instead of Elasticsearch
+- Local file storage instead of S3
+
+### For Cloud Deployment
+- Serverless functions for infrequent tasks
+- Auto-scaling based on queue depth
+- Shared resource pools
+- Edge caching for static content
+
+## Technical Recommendations
+
+### 1. Use Feature Flags
+```yaml
+features:
+  ai_summaries: ${ENABLE_AI_FEATURES:-false}
+  email_ingestion: ${ENABLE_EMAIL:-false}
+  advanced_search: ${ENABLE_ELASTICSEARCH:-false}
+  pdf_processing: ${ENABLE_PDF:-true}
+```
+
+### 2. Plugin Architecture
+```typescript
+interface OmnivorePlugin {
+  name: string
+  version: string
+  init(context: PluginContext): Promise<void>
+  handlers: {
+    [event: string]: Handler
+  }
+}
+```
+
+### 3. Deployment Profiles
+```yaml
+profiles:
+  minimal:
+    services: [core]
+    features: [basic_reading, highlighting]
+  
+  standard:
+    services: [core, worker]
+    features: [all_content_types, search]
+  
+  enterprise:
+    services: [core, worker, ai, analytics]
+    features: [all]
+```
+
+## Migration Path
+
+### Step 1: Code Consolidation
+- Move services into monorepo packages
+- Share common dependencies
+- Unified build process
+
+### Step 2: Runtime Consolidation
+- Services run as threads/processes
+- Shared memory and resources
+- Internal API calls become function calls
+
+### Step 3: Deployment Consolidation
+- Single Docker image with feature flags
+- Compose file for multi-container option
+- Kubernetes manifests for scale
+
+## Success Metrics
+
+### Performance
+- 50% reduction in cold start time
+- 75% reduction in memory usage (self-hosted)
+- 90% reduction in inter-service latency
+
+### Cost
+- 80% reduction in cloud hosting costs
+- Single-digit dollar monthly cost for small deployments
+- Pay-per-use model for expensive features
+
+### Developer Experience
+- Single command to run everything locally
+- 5-minute setup time
+- Clear contribution guidelines
+
+## Risk Mitigation
+
+### 1. Feature Parity
+- Comprehensive test suite before consolidation
+- Feature flags for gradual rollout
+- Ability to run services separately if needed
+
+### 2. Performance
+- Benchmark before and after
+- Load testing for concurrent users
+- Resource monitoring and limits
+
+### 3. Backward Compatibility
+- API versioning
+- Migration tools for existing deployments
+- Clear upgrade path documentation
+
+## Next Steps
+
+1. Create proof of concept for service consolidation
+2. Benchmark performance impact
+3. Design plugin architecture
+4. Plan migration timeline
+5. Engage community for feedback
+
+This architecture will dramatically simplify Omnivore while maintaining its powerful features and open-source nature.