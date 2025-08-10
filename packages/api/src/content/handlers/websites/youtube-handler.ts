/**
 * YouTube Content Handler
 *
 * Specialized handler for YouTube videos with transcript and metadata extraction.
 */

import { logger as baseLogger } from '../../../utils/logger'
import { ContentType } from '../../../events/content/content-save-event'
import { ContentHandler, RawContent, ExtractionOptions } from '../../types'

export class YouTubeHandler implements ContentHandler {
  public readonly name = 'youtube-handler'
  public readonly urlPatterns = [/youtube\.com/i, /youtu\.be/i]

  private logger = baseLogger.child({ context: 'youtube-handler' })

  canHandle(url: string, contentType: ContentType): boolean {
    try {
      const parsedUrl = new URL(url)
      const hostname = parsedUrl.hostname.toLowerCase()
      return hostname.includes('youtube.com') || hostname.includes('youtu.be')
    } catch {
      return false
    }
  }

  async extract(
    url: string,
    options: ExtractionOptions = {}
  ): Promise<RawContent> {
    this.logger.debug('Extracting YouTube content', { url })

    const youtubeOptions: ExtractionOptions = {
      ...options,
      waitForSelector: '#title, .title',
      customScripts: this.getYouTubeScripts(),
      enableJavaScript: true,
    }

    throw new Error(
      'YouTube handler requires integration with extraction service'
    )
  }

  async process(content: RawContent): Promise<RawContent> {
    this.logger.debug('Processing YouTube content', { url: content.url })

    try {
      const processedContent = { ...content }
      const youtubeMetadata = this.extractYouTubeMetadata(content)

      processedContent.metadata = {
        ...content.metadata,
        ...youtubeMetadata,
        processedBy: this.name,
      }

      return processedContent
    } catch (error) {
      this.logger.error('YouTube content processing failed', {
        url: content.url,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return content
    }
  }

  private extractYouTubeMetadata(content: RawContent): Record<string, any> {
    return {
      platform: 'YouTube',
      contentType: 'video',
      videoId: this.extractVideoId(content.url),
    }
  }

  private extractVideoId(url: string): string | undefined {
    try {
      const parsedUrl = new URL(url)
      if (parsedUrl.hostname.includes('youtube.com')) {
        return parsedUrl.searchParams.get('v') || undefined
      }
      if (parsedUrl.hostname.includes('youtu.be')) {
        return parsedUrl.pathname.substring(1) || undefined
      }
    } catch {
      return undefined
    }
  }

  private getYouTubeScripts(): string[] {
    return [
      `
        if (window.location.hostname.includes('youtube.com')) {
          const waitForContent = () => {
            return new Promise((resolve) => {
              const checkContent = () => {
                const title = document.querySelector('#title, .title');
                if (title && title.textContent) {
                  resolve(true);
                } else {
                  setTimeout(checkContent, 100);
                }
              };
              checkContent();
            });
          };
          waitForContent();
        }
      `,
    ]
  }

  shouldPreprocess(url: string, dom?: Document): boolean {
    return this.canHandle(url, ContentType.HTML)
  }

  getCapabilities() {
    return {
      name: this.name,
      supportedDomains: ['youtube.com', 'youtu.be'],
      supportedContentTypes: [ContentType.HTML, ContentType.YOUTUBE],
      features: {
        videoMetadata: true,
        transcriptExtraction: false, // Would need additional implementation
        customScripts: true,
        requiresJavaScript: true,
      },
    }
  }
}
