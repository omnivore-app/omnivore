import { randomUUID } from 'crypto'
import { DataSource } from 'typeorm'
import {
  LibraryItemEntity,
  LibraryItemState,
  ContentReaderType,
} from '../../library/entities/library-item.entity'

/**
 * Seed example library items for a user (for testing)
 * Usage: Call this function after user registration in development
 */
export async function seedLibraryItems(
  dataSource: DataSource,
  userId: string,
): Promise<LibraryItemEntity[]> {
  console.log(`[Seed] Starting seed for user ${userId}...`)

  const libraryRepository = dataSource.getRepository(LibraryItemEntity)

  const sampleItems = [
    {
      userId,
      title: 'Building Scalable NestJS Applications',
      slug: 'building-scalable-nestjs-applications',
      originalUrl: 'https://docs.nestjs.com/techniques/database',
      author: 'NestJS Team',
      description:
        'Learn how to build scalable, maintainable applications with NestJS framework',
      state: LibraryItemState.SUCCEEDED,
      contentReader: ContentReaderType.WEB,
      folder: 'inbox',
      itemType: 'ARTICLE',
      wordCount: 2500,
      siteName: 'NestJS Docs',
      readingProgressTopPercent: 0,
      readingProgressBottomPercent: 0,
      savedAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    },
    {
      userId,
      title: 'GraphQL Best Practices 2025',
      slug: 'graphql-best-practices-2025',
      originalUrl: 'https://graphql.org/learn/best-practices/',
      author: 'GraphQL Foundation',
      description:
        'Modern best practices for designing and implementing GraphQL APIs',
      state: LibraryItemState.SUCCEEDED,
      contentReader: ContentReaderType.WEB,
      folder: 'inbox',
      itemType: 'ARTICLE',
      wordCount: 3200,
      siteName: 'GraphQL.org',
      readingProgressTopPercent: 45,
      readingProgressBottomPercent: 40,
      savedAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    },
    {
      userId,
      title: 'Understanding React Server Components',
      slug: 'understanding-react-server-components',
      originalUrl:
        'https://react.dev/reference/react/use-server',
      author: 'React Team',
      description:
        'Deep dive into React Server Components and their impact on modern web applications',
      state: LibraryItemState.SUCCEEDED,
      contentReader: ContentReaderType.WEB,
      folder: 'inbox',
      itemType: 'ARTICLE',
      wordCount: 4100,
      siteName: 'React.dev',
      readingProgressTopPercent: 100,
      readingProgressBottomPercent: 100,
      readAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      savedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    },
    {
      userId,
      title: 'TypeScript 5.8 Release Notes',
      slug: 'typescript-5-8-release-notes',
      originalUrl: 'https://devblogs.microsoft.com/typescript/',
      author: 'TypeScript Team',
      description:
        'New features and improvements in TypeScript 5.8 release',
      state: LibraryItemState.SUCCEEDED,
      contentReader: ContentReaderType.WEB,
      folder: 'archive',
      itemType: 'ARTICLE',
      wordCount: 1800,
      siteName: 'TypeScript Blog',
      readingProgressTopPercent: 100,
      readingProgressBottomPercent: 100,
      readAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      savedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    },
    {
      userId,
      title: 'PostgreSQL Performance Tuning Guide',
      slug: 'postgresql-performance-tuning-guide',
      originalUrl: 'https://www.postgresql.org/docs/current/performance-tips.html',
      author: 'PostgreSQL Community',
      description:
        'Comprehensive guide to optimizing PostgreSQL database performance',
      state: LibraryItemState.SUCCEEDED,
      contentReader: ContentReaderType.WEB,
      folder: 'inbox',
      itemType: 'ARTICLE',
      wordCount: 5400,
      siteName: 'PostgreSQL Docs',
      readingProgressTopPercent: 15,
      readingProgressBottomPercent: 10,
      savedAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    },
  ]

  const createdItems: LibraryItemEntity[] = []

  for (const itemData of sampleItems) {
    try {
      console.log(`[Seed] Attempting to create: ${itemData.title}`)

      const item = libraryRepository.create({
        id: randomUUID(), // Manually generate UUID like E2E tests do
        ...itemData,
        user: { id: userId } as any, // TypeORM relation requirement
        readingProgressLastReadAnchor: itemData.readingProgressTopPercent > 0 ? 1 : 0,
        readingProgressHighestReadAnchor: itemData.readingProgressTopPercent > 0 ? 1 : 0,
      })

      console.log(`[Seed] Created entity object, now saving...`)
      const saved = await libraryRepository.save(item)
      console.log(`[Seed] ✓ Created item: ${saved.title} (ID: ${saved.id})`)
      createdItems.push(saved)
    } catch (error: any) {
      console.error(`[Seed] ✗ Failed to create item "${itemData.title}":`)
      console.error(`[Seed] Error name: ${error?.name}`)
      console.error(`[Seed] Error message: ${error?.message}`)
      if (error?.detail) console.error(`[Seed] Error detail: ${error.detail}`)
      if (error?.constraint) console.error(`[Seed] Constraint: ${error.constraint}`)
      console.error(`[Seed] Full error:`, error)
    }
  }

  console.log(`✅ [Seed] Completed: ${createdItems.length}/${sampleItems.length} items created for user ${userId}`)

  return createdItems
}
