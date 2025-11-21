// Utility functions for reading time calculation and timestamp formatting

/**
 * Calculate estimated reading time from word count
 * @param wordCount - Number of words in the article (from backend)
 * @returns Formatted reading time string (e.g., "5 min")
 *
 * Note: Backend now calculates accurate word count (strips HTML).
 * Uses 238 WPM (average adult reading speed) and rounds down
 * to avoid overestimating reading time.
 */
export function calculateReadingTime(
  wordCount: number | null | undefined
): string {
  if (!wordCount || wordCount <= 0) return ''

  // Average adult reading speed: 238 words per minute
  // Source: https://www.sciencedirect.com/science/article/abs/pii/S0749596X19300786
  const averageWordsPerMinute = 238

  // Round DOWN to avoid overestimating (floor instead of ceil)
  const minutes = Math.floor(wordCount / averageWordsPerMinute)

  if (minutes < 1) return '< 1 min'
  if (minutes === 1) return '1 min'
  
  return `${minutes} min`
}

/**
 * Format timestamp as relative time or absolute date
 * @param dateString - ISO date string
 * @returns Formatted timestamp (e.g., "2h ago", "3d ago", or "Jan 15, 2024")
 */
export function formatTimestamp(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))

  // Less than 1 hour
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes === 1) return '1 minute ago'
    
    return `${diffInMinutes} minutes ago`
  }

  // Less than 24 hours
  if (diffInHours < 24) {
    if (diffInHours === 1) return '1 hour ago'
    
    return `${diffInHours} hours ago`
  }

  // Less than 7 days
  if (diffInHours < 168) {
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return '1 day ago'
    
    return `${diffInDays} days ago`
  }

  // More than a week - show formatted date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

/**
 * Get progress bar color based on reading progress percentage
 * @param percent - Reading progress percentage (0-100)
 * @returns CSS color string
 */
export function getProgressColor(percent: number): string {
  if (percent === 0) return '#666'
  if (percent < 25) return '#4a9eff'
  if (percent < 75) return '#ffd234'
  if (percent < 100) return '#ff9500'
  
  return '#4caf50' // Completed
}

/**
 * Format reading progress for display
 * @param topPercent - Top reading progress percentage
 * @param bottomPercent - Bottom reading progress percentage
 * @returns Formatted progress string (e.g., "45% read")
 */
export function formatReadingProgress(
  topPercent: number | null | undefined,
  bottomPercent: number | null | undefined
): string {
  const percent = topPercent ?? 0
  if (percent === 0) return ''
  if (percent >= 100) return 'Completed'
  
  return `${Math.round(percent)}% read`
}
