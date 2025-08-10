/**
 * Stack Overflow Content Handler
 *
 * Specialized handler for Stack Overflow questions and answers.
 */

import { logger as baseLogger } from '../../../utils/logger'
import { ContentType } from '../../../events/content/content-save-event'
import { ContentHandler, RawContent, ExtractionOptions } from '../../types'

export class StackOverflowHandler implements ContentHandler {
  public readonly name = 'stackoverflow-handler'
  public readonly urlPatterns = [/stackoverflow\.com/i, /stackexchange\.com/i]

  private logger = baseLogger.child({ context: 'stackoverflow-handler' })

  canHandle(url: string, contentType: ContentType): boolean {
    try {
      const parsedUrl = new URL(url)
      const hostname = parsedUrl.hostname.toLowerCase()
      return (
        hostname.includes('stackoverflow.com') ||
        hostname.includes('stackexchange.com')
      )
    } catch {
      return false
    }
  }

  async extract(
    url: string,
    options: ExtractionOptions = {}
  ): Promise<RawContent> {
    this.logger.debug('Extracting Stack Overflow content', { url })

    const stackOverflowOptions: ExtractionOptions = {
      ...options,
      waitForSelector: '.question, .answer',
    }

    throw new Error(
      'Stack Overflow handler requires integration with extraction service'
    )
  }

  async process(content: RawContent): Promise<RawContent> {
    this.logger.debug('Processing Stack Overflow content', { url: content.url })

    try {
      const processedContent = { ...content }
      const stackOverflowMetadata = this.extractStackOverflowMetadata(content)

      processedContent.metadata = {
        ...content.metadata,
        ...stackOverflowMetadata,
        processedBy: this.name,
      }

      return processedContent
    } catch (error) {
      this.logger.error('Stack Overflow content processing failed', {
        url: content.url,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return content
    }
  }

  private extractStackOverflowMetadata(
    content: RawContent
  ): Record<string, any> {
    const metadata: Record<string, any> = {
      platform: 'Stack Overflow',
      contentType: 'question',
    }

    // Extract question ID from URL
    const match = content.url.match(/\/questions\/(\d+)/)
    if (match) {
      metadata.questionId = match[1]
    }

    return metadata
  }

  shouldPreprocess(url: string, dom?: Document): boolean {
    return this.canHandle(url, ContentType.HTML)
  }

  getCapabilities() {
    return {
      name: this.name,
      supportedDomains: ['stackoverflow.com', 'stackexchange.com'],
      supportedContentTypes: [ContentType.HTML],
      features: {
        questionExtraction: true,
        answerExtraction: true,
        codeBlockPreservation: true,
      },
    }
  }
}
