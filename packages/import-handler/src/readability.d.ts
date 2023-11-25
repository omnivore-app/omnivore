// Type definitions for non-npm package mozilla-readability 0.2
// Project: https://github.com/mozilla/readability
// Definitions by: Charles Vandevoorde <https://github.com/charlesvdv>, Alex Wendland <https://github.com/awendland>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.2

declare module '@omnivore/readability' {
  class Readability {
    constructor(doc: Document, options?: Readability.Options)

    async parse(): Promise<Readability.ParseResult | null>
  }

  namespace Readability {
    interface Options {
      /**
       * Control whether log messages are sent to the console
       */
      debug?: boolean

      /**
       * Set a maximum size on the documents that will be processed. This size is
       * checked before any parsing operations occur. If the number of elements in
       * the document exceeds this threshold then an Error will be thrown.
       *
       * See implementation details at https://github.com/mozilla/readability/blob/52ab9b5c8916c306a47b2119270dcdabebf9d203/Readability.js#L2019
       */
      maxElemsToParse?: number

      nbTopCandidates?: number

      /**
       * Minimum number of characters in the extracted textContent in order to
       * consider the article correctly identified. If the threshold is not met then
       * the extraction process will automatically run again with different flags.
       *
       * See implementation details at https://github.com/mozilla/readability/blob/52ab9b5c8916c306a47b2119270dcdabebf9d203/Readability.js#L1208
       *
       * Changed from wordThreshold in https://github.com/mozilla/readability/commit/3ff9a166fb27928f222c4c0722e730eda412658a
       */
      charThreshold?: number

      /**
       * parse() removes the class="" attribute from every element in the given
       * subtree, except those that match CLASSES_TO_PRESERVE and
       * the classesToPreserve array from the options object.
       */
      classesToPreserve?: string[]

      /**
       * By default Readability will strip all classes from the HTML elements in the
       * processed article. By setting this to `true` the classes will be retained.
       *
       * This is a blanket alternative to `classesToPreserve`.
       *
       * Added in https://github.com/mozilla/readability/commit/2982216913af2c66b0690e88606b03116553ad92
       */

      keepClasses?: boolean
      url?: string

      /**
       * Function that converts a regular image url into imageproxy url
       * @param url string
       */
      createImageProxyUrl?: (
        url: string,
        width?: number,
        height?: number,
      ) => string

      /**
       * By default, Readability will clean all tables from the HTML elements in the
       * processed article. But newsletters in emails use tables to display their content.
       * By setting this to `true`, these tables will be retained.
       */
      keepTables?: boolean
    }

    interface ParseResult {
      /** Article title */
      title: string
      /** Author metadata */
      byline?: string | null
      /** Content direction */
      dir?: string | null
      /** HTML string of processed article content */
      content: string
      /** non-HTML version of `content`  */
      textContent: string
      /** Length of an article, in characters */
      length: number
      /** Article description, or short excerpt from the content */
      excerpt: string
      /** Article site name */
      siteName?: string | null
      /** Article site icon */
      siteIcon?: string | null
      /** Article preview image */
      previewImage?: string | null
      /** Article published date */
      publishedDate?: Date | null
      language?: string | null
    }
  }

  export { Readability }
}
