# Content Processing Implementation

This document outlines the implementation of the new event-driven content processing system for Omnivore.

## Overview

The implementation moves from a direct queue-based approach to an event-driven architecture where:

1. **User saves a link** → Library item created in `Processing` state
2. **ContentSaveRequestedEvent emitted** → Event queued for processing
3. **Content worker processes event** → Fetches and processes content using content-fetch service
4. **Library item updated** → State changes to `Succeeded` or `Failed`

## Architecture Components

### State Machine

```
[Requested] → [Processing] → [ContentFetched] → [ContentParsed] → [Succeeded]
     ↓              ↓
   [Failed] ← [Processing] (retry)
```

### Core Components

1. **Event System** (`packages/api/src/events/`)

   - `ContentSaveRequestedEvent`: Event data structure with validation
   - `EventManager`: Handles event routing and queue management

2. **Content Worker** (`packages/api/src/workers/`)

   - `ContentWorker`: Main worker class handling content processing events
   - `content-processing-service.ts`: Content processing logic by type
   - `content-worker-helpers.ts`: Helper functions for labels, thumbnails, rules

3. **Content Type Detection** (`packages/api/src/utils/`)

   - `content-type-detector.ts`: Determines content type from URL and MIME type

4. **Integration Tests** (`packages/api/test/integration/`)
   - `content-processing.test.ts`: End-to-end tests for the complete workflow

## Implementation Details

### Content Processing Flow

1. **Link Saving** (`create_page_save_request.ts`):

   ```typescript
   // Create library item in processing state
   const libraryItem = await createOrUpdateLibraryItem({...})

   // Emit content save requested event
   await eventManager.emit(new ContentSaveRequestedEvent({
     userId, libraryItemId, url, contentType, metadata
   }))
   ```

2. **Event Processing** (`ContentWorker`):

   ```typescript
   // Process content based on type
   switch (contentType) {
     case ContentType.HTML:
       processedContent = await processHtmlContent(url, metadata)
       break
     // ... other types
   }

   // Update library item with results
   await updateLibraryItem(libraryItemId, processedContent, userId)
   ```

3. **Content Fetching** (`content-processing-service.ts`):

   ```typescript
   // Uses existing content-fetch service
   const fetchResult = await fetchContentFromService(url, locale, timezone)

   // Processes and returns structured content
   return {
     title,
     author,
     description,
     content,
     wordCount,
     siteName,
     thumbnail,
     itemType,
     contentHash,
   }
   ```

### Supported Content Types

- **HTML**: Web articles and pages
- **PDF**: Document files with text extraction
- **EMAIL**: Email content processing
- **RSS**: RSS/Atom feed items
- **YOUTUBE**: Video content with transcript extraction

### Error Handling and Retries

- **Exponential backoff**: 2s initial delay, 3 retry attempts
- **Graceful degradation**: Failed processing sets item state to `Failed`
- **Fallback mechanism**: Direct queue enqueueing if event system fails

### Performance Features

- **Concurrent processing**: Worker handles multiple jobs simultaneously
- **Queue management**: Configurable concurrency and rate limiting
- **Caching**: Leverages existing content-fetch caching
- **Resource cleanup**: Proper worker shutdown and cleanup

## Testing Strategy

### Integration Tests

The implementation includes comprehensive integration tests covering:

- **End-to-end workflow**: Link saving → processing → completion
- **Content type handling**: HTML, PDF, email, RSS, YouTube
- **Error scenarios**: Network failures, invalid content, retries
- **Performance testing**: Concurrent processing of multiple items
- **State transitions**: Proper state management throughout lifecycle

### Test Structure

```typescript
describe('Content Processing Integration', () => {
  // Setup test user, worker, and mocks

  it('should create library item in processing state when user saves link')
  it('should emit ContentSaveRequestedEvent when library item is created')
  it('should process content when event is handled')
  it('should handle PDF content processing')
  it('should handle processing failures gracefully')
  it('should support retry mechanism for failed processing')
  it('should process multiple items concurrently')
})
```

## Migration Strategy

### Phase 1: Parallel Implementation ✅

- New event-driven system runs alongside existing queue system
- Event emission with fallback to direct enqueueing
- Comprehensive testing of new system

### Phase 2: Gradual Migration

- Enable event system for new content processing
- Monitor performance and reliability
- Migrate existing queue jobs to event system

### Phase 3: Legacy Removal

- Remove direct queue enqueueing code
- Clean up old content processing jobs
- Update documentation and deployment scripts

## Configuration

### Environment Variables

```bash
# Content processing
CONTENT_FETCH_URL=http://content-fetch-service:3000
CONTENT_FETCH_TOKEN=your-service-token

# Queue configuration
REDIS_URL=redis://localhost:6379
MQ_REDIS_URL=redis://localhost:6379

# Feature flags
CONTENT_FETCH_QUEUE_ENABLED=true
```

### Queue Configuration

```typescript
// Event routing configuration
{
  queueName: 'content-processing',
  jobName: 'process-content-save',
  jobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  }
}
```

## Monitoring and Observability

### Logging

- Structured logging with context (user ID, library item ID, URL)
- Performance metrics (processing time, queue depth)
- Error tracking with detailed error messages

### Health Checks

```typescript
GET /health
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "contentWorker": {
    "isRunning": true,
    "queueName": "content-processing",
    "processedJobs": 1234,
    "failedJobs": 12
  }
}
```

### Metrics

- Content processing success/failure rates
- Processing time by content type
- Queue depth and throughput
- Worker performance and resource usage

## Benefits

1. **Simplified Architecture**: Clear separation of concerns with event-driven design
2. **Better Scalability**: Independent scaling of content processing workers
3. **Improved Reliability**: Proper error handling, retries, and state management
4. **Enhanced Testability**: Comprehensive test coverage with realistic scenarios
5. **Rich User Experience**: Better state management and user feedback
6. **Maintainability**: Cleaner code organization and easier debugging

## Future Enhancements

1. **Priority Processing**: Different priorities based on content type and user tier
2. **Content Enrichment**: AI-powered summarization and metadata extraction
3. **Batch Processing**: Efficient handling of bulk imports
4. **Real-time Updates**: WebSocket notifications for processing status
5. **Advanced Caching**: Intelligent content caching strategies
6. **Analytics Integration**: Content processing analytics and insights

This implementation provides a robust foundation for content processing that can scale with Omnivore's growth while maintaining a rich user experience.
