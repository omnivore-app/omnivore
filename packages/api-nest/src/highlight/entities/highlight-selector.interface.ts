/**
 * Web Annotation Data Model selectors for robust text positioning
 * Based on W3C Web Annotation specification: https://www.w3.org/TR/annotation-model/
 *
 * These selectors provide multiple strategies for locating highlighted text,
 * making highlights resilient to content changes.
 */

/**
 * TextQuoteSelector - identifies text by quoting it directly
 * Most common selector type for web highlights
 *
 * @see https://www.w3.org/TR/annotation-model/#text-quote-selector
 */
export interface TextQuoteSelector {
  /** The exact text being highlighted */
  exact: string
  /** Text immediately before the selection (for disambiguation) */
  prefix?: string
  /** Text immediately after the selection (for disambiguation) */
  suffix?: string
}

/**
 * TextPositionSelector - identifies text by character position
 * Useful as a fallback when text quote matching fails
 *
 * @see https://www.w3.org/TR/annotation-model/#text-position-selector
 */
export interface TextPositionSelector {
  /** Starting character position in the document */
  start: number
  /** Ending character position in the document */
  end: number
}

/**
 * XPathSelector - identifies elements using XPath expressions
 *
 * @see https://www.w3.org/TR/annotation-model/#xpath-selector
 */
export interface XPathSelector {
  /** XPath expression */
  value: string
}

/**
 * CSSSelector - identifies elements using CSS selectors
 *
 * @see https://www.w3.org/TR/annotation-model/#css-selector
 */
export interface CSSSelector {
  /** CSS selector expression */
  value: string
}

/**
 * RangeSelector - identifies text using DOM range
 * Most precise for HTML documents with stable structure
 *
 * @see https://www.w3.org/TR/annotation-model/#range-selector
 */
export interface RangeSelector {
  /** Start point of the range (XPath or CSS selector) */
  startSelector: XPathSelector | CSSSelector
  /** End point of the range (XPath or CSS selector) */
  endSelector: XPathSelector | CSSSelector
  /** Optional character offset within start element */
  startOffset?: number
  /** Optional character offset within end element */
  endOffset?: number
}

/**
 * HighlightSelectors - container for multiple selector strategies
 *
 * Following the Web Annotation pattern of using multiple selectors
 * for robust text positioning. The textQuote selector is required,
 * with optional fallback selectors.
 */
export interface HighlightSelectors {
  /** Primary selector using quoted text (REQUIRED) */
  textQuote: TextQuoteSelector
  /** Optional character position fallback */
  textPosition?: TextPositionSelector
  /** Optional DOM range fallback */
  domRange?: RangeSelector
  /** Allow additional custom selector strategies */
  [key: string]: unknown
}
