/**
 * Content Handlers
 *
 * Export all specialized content handlers and registry
 */

// Registry
export { HandlerRegistry } from './handler-registry'

// Newsletter handlers
export { SubstackHandler } from './newsletters/substack-handler'
export { GenericHandler } from './newsletters/generic-handler'

// Website handlers
export { MediumHandler } from './websites/medium-handler'
export { TwitterHandler } from './websites/twitter-handler'
export { YouTubeHandler } from './websites/youtube-handler'
export { GitHubHandler } from './websites/github-handler'
export { StackOverflowHandler } from './websites/stackoverflow-handler'

// Re-export types
export type { ContentHandler, ContentHandlerError } from '../types'
