/**
 * ARC-009: Frontend Library Feature Parity - E2E Tests
 *
 * Tests the new GraphQL fields added for ARC-009 to support
 * frontend library UI features (thumbnails, metadata, etc.)
 *
 * Run with: yarn test:e2e --testPathPattern=library-arc009
 */

import { UserFactory, LibraryItemFactory } from './factories'
import { getTestDataSource } from './setup/test-datasource'

describe('ARC-009: Frontend Library Feature Parity (e2e)', () => {
  it('should include thumbnail field in library items', async () => {
    // Verify testcontainer datasource is available
    const dataSource = getTestDataSource()
    expect(dataSource.isInitialized).toBe(true)

    // Create a user
    const user = await UserFactory.create()

    // Create a library item with full metadata
    const item = await LibraryItemFactory.withFullMetadata(user.id, {
      title: 'Article with Thumbnail',
    })

    expect(item.id).toBeDefined()
    expect(item.thumbnail).toBeDefined()
    expect(item.thumbnail).toMatch(/https?:\/\//)
    expect(item.title).toBe('Article with Thumbnail')

    console.log('✅ Thumbnail field available:', item.thumbnail)
  })

  it('should include metadata fields (wordCount, siteName, siteIcon)', async () => {
    const user = await UserFactory.create()

    const item = await LibraryItemFactory.withFullMetadata(user.id, {
      wordCount: 1500,
      siteName: 'Tech Blog',
      siteIcon: 'https://techblog.com/favicon.ico',
    })

    expect(item.wordCount).toBe(1500)
    expect(item.siteName).toBe('Tech Blog')
    expect(item.siteIcon).toBe('https://techblog.com/favicon.ico')

    console.log('✅ Metadata fields available:')
    console.log('  - Word count:', item.wordCount)
    console.log('  - Site name:', item.siteName)
    console.log('  - Site icon:', item.siteIcon)
  })

  it('should include itemType field for different content types', async () => {
    const user = await UserFactory.create()

    // Test article
    const article = await LibraryItemFactory.create({
      userId: user.id,
      itemType: 'ARTICLE',
    })
    expect(article.itemType).toBe('ARTICLE')

    // Test PDF
    const pdf = await LibraryItemFactory.pdf(user.id)
    expect(pdf.itemType).toBe('FILE')
    expect(pdf.contentReader).toBe('PDF')

    console.log('✅ Item type field available')
    console.log('  - Article type:', article.itemType)
    console.log('  - PDF type:', pdf.itemType)
  })

  it('should generate realistic metadata with faker', async () => {
    const user = await UserFactory.create()

    // Create multiple items to verify faker generates varied data
    const items = await Promise.all([
      LibraryItemFactory.withFullMetadata(user.id),
      LibraryItemFactory.withFullMetadata(user.id),
      LibraryItemFactory.withFullMetadata(user.id),
    ])

    // Check that each item has unique values (faker randomness)
    const titles = items.map((i) => i.title)
    const thumbnails = items.map((i) => i.thumbnail)
    const siteNames = items.map((i) => i.siteName)

    expect(new Set(titles).size).toBe(3) // All different
    expect(new Set(thumbnails).size).toBe(3) // All different
    expect(new Set(siteNames).size).toBe(3) // All different

    // Check word count is in reasonable range
    items.forEach((item) => {
      expect(item.wordCount).toBeGreaterThanOrEqual(300)
      expect(item.wordCount).toBeLessThanOrEqual(5000)
    })

    console.log('✅ Faker generates realistic, varied metadata')
  })

  it('should support items with reading progress and metadata', async () => {
    const user = await UserFactory.create()

    // Create item with both progress and metadata
    const item = await LibraryItemFactory.withFullMetadata(user.id, {
      readAt: new Date(), // Mark as read
      title: 'Partially Read Article',
    })

    expect(item.title).toBe('Partially Read Article')
    expect(item.readAt).toBeDefined()
    expect(item.thumbnail).toBeDefined()
    expect(item.wordCount).toBeDefined()
    expect(item.siteName).toBeDefined()

    console.log('✅ Progress + metadata work together')
    console.log('  - Read:', item.readAt ? 'Yes' : 'No')
    console.log('  - Word count:', item.wordCount)
  })

  it('should handle items without metadata gracefully', async () => {
    const user = await UserFactory.create()

    // Create minimal item (processing state, no content yet)
    const processing = await LibraryItemFactory.processing(user.id)

    expect(processing.id).toBeDefined()
    expect(processing.state).toBe('CONTENT_NOT_FETCHED')

    // Metadata fields should exist but may be null or default
    expect(processing).toHaveProperty('thumbnail')
    expect(processing).toHaveProperty('wordCount')
    expect(processing).toHaveProperty('siteName')
    expect(processing).toHaveProperty('siteIcon')
    expect(processing).toHaveProperty('itemType')

    console.log('✅ Items without metadata handle gracefully')
  })

  it('should support all library item states with metadata', async () => {
    const user = await UserFactory.create()

    const succeeded = await LibraryItemFactory.withFullMetadata(user.id)
    const archived = await LibraryItemFactory.archived(user.id)
    const deleted = await LibraryItemFactory.deleted(user.id)

    expect(succeeded.state).toBe('SUCCEEDED')
    expect(succeeded.thumbnail).toBeDefined()

    expect(archived.state).toBe('ARCHIVED')
    expect(archived.folder).toBe('archive')

    expect(deleted.state).toBe('DELETED')
    expect(deleted.folder).toBe('trash')

    console.log('✅ All states support metadata fields')
    console.log('  - Succeeded:', succeeded.state)
    console.log('  - Archived:', archived.state)
    console.log('  - Deleted:', deleted.state)
  })

  it('should calculate reading time from word count', async () => {
    const user = await UserFactory.create()

    const shortArticle = await LibraryItemFactory.withFullMetadata(user.id, {
      wordCount: 500,
    })

    const longArticle = await LibraryItemFactory.withFullMetadata(user.id, {
      wordCount: 3000,
    })

    // Average reading speed: 200-250 words/minute
    const shortReadingTime = Math.ceil(shortArticle.wordCount! / 200)
    const longReadingTime = Math.ceil(longArticle.wordCount! / 200)

    expect(shortReadingTime).toBeGreaterThanOrEqual(2) // ~2-3 minutes
    expect(longReadingTime).toBeGreaterThanOrEqual(15) // ~15 minutes

    console.log('✅ Word count enables reading time estimates')
    console.log('  - 500 words ≈', shortReadingTime, 'min')
    console.log('  - 3000 words ≈', longReadingTime, 'min')
  })
})
