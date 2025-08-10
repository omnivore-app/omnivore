/**
 * GitHub Content Handler
 *
 * Specialized handler for GitHub repositories, issues, and pull requests.
 */

import { logger as baseLogger } from '../../../utils/logger'
import { ContentType } from '../../../events/content/content-save-event'
import { ContentHandler, RawContent, ExtractionOptions } from '../../types'

export class GitHubHandler implements ContentHandler {
  public readonly name = 'github-handler'
  public readonly urlPatterns = [/github\.com/i]

  private logger = baseLogger.child({ context: 'github-handler' })

  canHandle(url: string, contentType: ContentType): boolean {
    try {
      const parsedUrl = new URL(url)
      return parsedUrl.hostname.includes('github.com')
    } catch {
      return false
    }
  }

  async extract(
    url: string,
    options: ExtractionOptions = {}
  ): Promise<RawContent> {
    this.logger.debug('Extracting GitHub content', { url })

    const githubOptions: ExtractionOptions = {
      ...options,
      waitForSelector:
        '.repository-content, .js-issue-title, .js-pull-request-title',
    }

    throw new Error(
      'GitHub handler requires integration with extraction service'
    )
  }

  async process(content: RawContent): Promise<RawContent> {
    this.logger.debug('Processing GitHub content', { url: content.url })

    try {
      const processedContent = { ...content }
      const githubMetadata = this.extractGitHubMetadata(content)

      processedContent.metadata = {
        ...content.metadata,
        ...githubMetadata,
        processedBy: this.name,
      }

      return processedContent
    } catch (error) {
      this.logger.error('GitHub content processing failed', {
        url: content.url,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return content
    }
  }

  private extractGitHubMetadata(content: RawContent): Record<string, any> {
    const metadata: Record<string, any> = {
      platform: 'GitHub',
    }

    const urlPath = new URL(content.url).pathname
    const pathParts = urlPath.split('/').filter(Boolean)

    if (pathParts.length >= 2) {
      metadata.owner = pathParts[0]
      metadata.repository = pathParts[1]

      if (pathParts[2] === 'issues' && pathParts[3]) {
        metadata.contentType = 'issue'
        metadata.issueNumber = pathParts[3]
      } else if (pathParts[2] === 'pull' && pathParts[3]) {
        metadata.contentType = 'pull_request'
        metadata.pullRequestNumber = pathParts[3]
      } else {
        metadata.contentType = 'repository'
      }
    }

    return metadata
  }

  shouldPreprocess(url: string, dom?: Document): boolean {
    return this.canHandle(url, ContentType.HTML)
  }

  getCapabilities() {
    return {
      name: this.name,
      supportedDomains: ['github.com'],
      supportedContentTypes: [ContentType.HTML],
      features: {
        repositoryMetadata: true,
        issueExtraction: true,
        pullRequestExtraction: true,
      },
    }
  }
}
