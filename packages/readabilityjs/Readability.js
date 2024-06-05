/*eslint-env es6:false*/
/*
 * Copyright (c) 2010 Arc90 Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * This code is heavily based on Arc90's readability.js (1.7.1) script
 * available at: http://code.google.com/p/arc90labs-readability
 */

var parseSrcset = require('parse-srcset');
var htmlEntities = require('html-entities')
const axios = require("axios");
const cld = require('cld');

/** Checks whether an element is a wrapper for tweet */
const hasTweetInChildren = element => {
  if (element.getElementsByClassName === undefined) {
    return false;
  }
  const candidates = element.getElementsByClassName('tweet-placeholder');
  return candidates.length > 0;
};

const parentClassIncludes = (element, className) => {
  let parent = element.parentElement || element.parentNode;

  while (parent && parent.tagName !== 'BODY') {
    if (parent.className.includes(className)) {
      return true;
    }
    parent = parent.parentElement || parent.parentNode;
  }
  return false;
};

/** Some articles might have published date listed alongside author, for instance 'John DoeMarch 15, 2015' */
const extractPublishedDateFromAuthor = (author)=> {
  if (!author) {
    return [null, null];
  }
  const authorName = author.replace(/^by\s+/i, '');
  const regex = /(January|February|March|April|May|June|July|August|September|October|November|December)\s\d{1,2},\s\d{2,4}/i;
  const chineseDateRegex = /(\d{2,4})年(\d{1,2})月(\d{1,2})日/;

  // English date
  if (regex.test(author)) {
    const match = author.match(regex) || [];
    return [authorName.replace(regex, ''), match[0]];
  }

  // Chinese date
  if (chineseDateRegex.test(author)) {
    const match = author.match(chineseDateRegex);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1; // January is 0 in JavaScript Date
      const day = parseInt(match[3], 10);
  
      const publishedAt = new Date(year, month, day);
      return [authorName.replace(chineseDateRegex, ''), publishedAt];
    }
  }

  return [authorName, null];
};

// extract published date from url if it's in the format of yyyy/mm/dd or yyyy-mm-dd
const extractPublishedDateFromUrl = (url) => {
  if (!url) return null;
  
  const regex = /(\d{4})(\/|-)(\d{2})(\/|-)(\d{2})/i;
  const match = url.match(regex);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[3], 10) - 1; // January is 0 in JavaScript Date
    const day = parseInt(match[5], 10);

    return new Date(year, month, day);
  }
  return null;
}

/**
 * Public constructor.
 * @param {Document} doc     The document to parse.
 * @param {Object}   options The options object.
 */
function Readability(doc, options) {
  // In some older versions, people passed a URI as the first argument. Cope:
  if (options && options.documentElement) {
    doc = options;
    options = arguments[2];
  } else if (!doc || !doc.documentElement) {
    throw new Error("First argument to Readability constructor should be a document object.");
  }
  options = options || {};
  this.createImageProxyUrl = options.createImageProxyUrl;
  this._keepTables = !!options.keepTables;

  this._doc = doc;
  this._docJSDOMParser = this._doc.firstChild.__JSDOMParser__;
  this._articleTitle = null;
  this._articleByline = null;
  this._articlePublishedDate = null;
  this._articleDir = null;
  this._languageCode = null;
  this._attempts = [];

  // Configurable options
  this._debug = !!options.debug;
  this._maxElemsToParse = options.maxElemsToParse || this.DEFAULT_MAX_ELEMS_TO_PARSE;
  this._nbTopCandidates = options.nbTopCandidates || this.DEFAULT_N_TOP_CANDIDATES;
  this._charThreshold = options.charThreshold || this.DEFAULT_CHAR_THRESHOLD;
  this._classesToPreserve = this.CLASSES_TO_PRESERVE.concat(options.classesToPreserve || []);
  this._keepClasses = !!options.keepClasses;
  this._serializer = options.serializer || function(el) {
    return el.innerHTML;
  };
  this._disableJSONLD = !!options.disableJSONLD;
  this._baseURI = options.url || this._doc.baseURI;
  this._documentURI = options.url || this._doc.documentURI;
  this._ignoreLinkDensity = options.ignoreLinkDensity || false

  // Start with all flags set
  this._flags = this.FLAG_STRIP_UNLIKELYS |
    this.FLAG_WEIGHT_CLASSES |
    this.FLAG_CLEAN_CONDITIONALLY;

  // Control whether log messages are sent to the console
  if (this._debug) {
    let logNode = function(node) {
      if (node.nodeType === node.TEXT_NODE) {
        return `${node.nodeName} ("${node.textContent}")`;
      }
      let attrPairs = Array.from(node.attributes || [], function(attr) {
        return `${attr.name}="${attr.value}"`;
      }).join(" ");
      return `<${node.localName} ${attrPairs}>`;
    };
    this.log = function () {
      if (typeof console !== "undefined") {
        let args = Array.from(arguments, arg => {
          if (arg && arg.nodeType == this.ELEMENT_NODE) {
            return logNode(arg);
          }
          return arg;
        });
        args.unshift("Reader: (Readability)");
        console.log.apply(console, args);
      } else if (typeof dump !== "undefined") {
        /* global dump */
        var msg = Array.prototype.map.call(arguments, function(x) {
          return (x && x.nodeName) ? logNode(x) : x;
        }).join(" ");
        dump("Reader: (Readability) " + msg + "\n");
      }
    };
  } else {
    this.log = function () {};
  }
}

Readability.prototype = {
  FLAG_STRIP_UNLIKELYS: 0x1,
  FLAG_WEIGHT_CLASSES: 0x2,
  FLAG_CLEAN_CONDITIONALLY: 0x4,

  // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
  ELEMENT_NODE: 1,
  TEXT_NODE: 3,

  // Max number of nodes supported by this parser. Default: 0 (no limit)
  DEFAULT_MAX_ELEMS_TO_PARSE: 0,

  // The number of top candidates to consider when analysing how
  // tight the competition is among candidates.
  DEFAULT_N_TOP_CANDIDATES: 5,

  // Element tags to score by default.
  DEFAULT_TAGS_TO_SCORE: "section,h2,h3,h4,h5,h6,p,td,pre".toUpperCase().split(","),

  // The default number of chars an article must have in order to return a result
  DEFAULT_CHAR_THRESHOLD: 500,

  // All of the regular expressions in use within readability.
  // Defined up here so we don't instantiate them repeatedly in loops.
  REGEXPS: {
    lazyLoadingElements: /\S*loading\S*/i,
    // NOTE: These two regular expressions are duplicated in
    // Readability-readerable.js. Please keep both copies in sync.
    articleNegativeLookBehindCandidates: /breadcrumbs|breadcrumb|utils|trilist|_header/i,
    articleNegativeLookAheadCandidates: /outstream(.?)_|sub(.?)_|m_|omeda-promo-|in-article-advert|block-ad-.*|tl_/i,
    unlikelyCandidates: /\bad\b|ai2html|banner|breadcrumbs|breadcrumb|combx|comment|community|cover-wrap|disqus|extra|footer|gdpr|header|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager(?!ow)|popup|yom-remote|copyright|keywords|outline|infinite-list|beta|recirculation|site-index|hide-for-print|post-end-share-cta|post-end-cta-full|post-footer|post-head|post-tag|li-date|main-navigation|programtic-ads|outstream_article|hfeed|comment-holder|back-to-top|show-up-next|onward-journey|topic-tracker|list-nav|block-ad-entity|adSpecs|gift-article-button|modal-title|in-story-masthead|share-tools|standard-dock|expanded-dock|margins-h|subscribe-dialog|icon|bumped|dvz-social-media-buttons|post-toc|mobile-menu|mobile-navbar|tl_article_header|mvp(-post)*-(add-story|soc(-mob)*-wrap)|w-condition-invisible|rich-text-block main w-richtext|rich-text-block_ataglance at-a-glance test w-richtext|PostsPage-commentsSection|hide-text|text-blurple|bottom-wrapper/i,
    // okMaybeItsACandidate: /and|article(?!-breadcrumb)|body|column|content|main|shadow|post-header/i,
    get okMaybeItsACandidate() {
      return new RegExp(`and|(?<!${this.articleNegativeLookAheadCandidates.source})article(?!-(${this.articleNegativeLookBehindCandidates.source}))|body|column|content|^(?!main-navigation|main-header)main|shadow|post-header|hfeed site|blog-posts hfeed|container-banners|menu-opacity|header-with-anchor-widget|commentOnSelection|highlight--with-header`, 'i')
    },

    positive: /article|body|content|entry|hentry|h-entry|main|page|pagination|post|text|blog|story|tweet(-\w+)?|instagram|image|container-banners|player|commentOnSelection/i,
    negative: /\bad\b|hidden|^hid$| hid$| hid |^hid |banner|combx|comment|com-|contact|footer|gdpr|masthead|media|meta|outbrain|promo|related|scroll|share|shoutbox|sidebar|skyscraper|sponsor|shopping|tags|tool|widget|controls|video-controls/i,
    extraneous: /print|archive|comment|discuss|e[\-]?mail|share|reply|all|login|sign|single|utility/i,
    byline: /byline|author|dateline|writtenby|p-author/i,
    publishedDate: /published|modified|created|updated/i,
    replaceFonts: /<(\/?)font[^>]*>/gi,
    normalize: /\s{2,}/g,
    videos: /\/\/(www\.)?((dailymotion|youtube|youtube-nocookie|player\.vimeo|v\.qq|cdnapisec\.kaltura)\.com|(archive|upload\.wikimedia)\.org|player\.twitch\.tv|piped\.mha\.fi)/i,
    shareElements: /(\b|_)(share|sharedaddy|post-tags)(\b|_)/i,
    nextLink: /(next|weiter|continue|>([^\|]|$)|»([^\|]|$))/i,
    prevLink: /(prev|earl|old|new|<|«)/i,
    tokenize: /\W+/g,
    whitespace: /^\s*$/,
    hasContent: /\S$/,
    hashUrl: /^#.+/,
    srcsetUrl: /(\S+)(\s+[\d.]+[xw])?(\s*(?:,|$))/g,
    b64DataUrl: /^data:\s*([^\s;,]+)\s*;\s*base64\s*,/i,
    // Commas as used in Latin, Sindhi, Chinese and various other scripts.
    // see: https://en.wikipedia.org/wiki/Comma#Comma_variants
    commas: /\u002C|\u060C|\uFE50|\uFE10|\uFE11|\u2E41|\u2E34|\u2E32|\uFF0C/g,
    // See: https://schema.org/Article
    jsonLdArticleTypes: /^Article|AdvertiserContentArticle|NewsArticle|AnalysisNewsArticle|AskPublicNewsArticle|BackgroundNewsArticle|OpinionNewsArticle|ReportageNewsArticle|ReviewNewsArticle|Report|SatiricalArticle|ScholarlyArticle|MedicalScholarlyArticle|SocialMediaPosting|BlogPosting|LiveBlogPosting|DiscussionForumPosting|TechArticle|APIReference$/,
    DATES_REGEXPS: [
      /([0-9]{4}[-\/]?((0[13-9]|1[012])[-\/]?(0[1-9]|[12][0-9]|30)|(0[13578]|1[02])[-\/]?31|02[-\/]?(0[1-9]|1[0-9]|2[0-8]))|([0-9]{2}(([2468][048]|[02468][48])|[13579][26])|([13579][26]|[02468][048]|0[0-9]|1[0-6])00)[-\/]?02[-\/]?29)/i,
      /(((0[13-9]|1[012])[-/]?(0[1-9]|[12][0-9]|30)|(0[13578]|1[02])[-/]?31|02[-/]?(0[1-9]|1[0-9]|2[0-8]))[-/]?[0-9]{4}|02[-/]?29[-/]?([0-9]{2}(([2468][048]|[02468][48])|[13579][26])|([13579][26]|[02468][048]|0[0-9]|1[0-6])00))/i,
      /(((0[1-9]|[12][0-9]|30)[-/]?(0[13-9]|1[012])|31[-/]?(0[13578]|1[02])|(0[1-9]|1[0-9]|2[0-8])[-/]?02)[-/]?[0-9]{4}|29[-/]?02[-/]?([0-9]{2}(([2468][048]|[02468][48])|[13579][26])|([13579][26]|[02468][048]|0[0-9]|1[0-6])00))/i,
    ],
    LONG_DATE_REGEXP: /^(Jan(uary)?|Feb(ruary)?|Mar(ch)?|Apr(il)?|May|Jun(e)?|Jul(y)?|Aug(ust)?|Sep(tember)?|Oct(ober)?|Nov(ember)?|Dec(ember)?)\s\d{1,2}(?:st|nd|rd|th)?(,)?\s\d{2,4}$/i,
    CHINESE_DATE_REGEXP: /^\d{2,4}年\d{1,2}月\d{1,2}日$/,
  },

  UNLIKELY_ROLES: ["menu", "menubar", "complementary", "navigation", "alert", "alertdialog", "dialog"],

  DIV_TO_P_ELEMS: new Set(["A", "BLOCKQUOTE", "DL", "DIV", "IMG", "OL", "P", "PRE", "TABLE", "UL", "SELECT"]),

  ALTER_TO_DIV_EXCEPTIONS: ["DIV", "ARTICLE", "SECTION", "P"],

  PRESENTATIONAL_ATTRIBUTES: ["align", "background", "bgcolor", "border", "cellpadding", "cellspacing", "frame", "hspace", "rules", "style", "valign", "vspace"],

  DEPRECATED_SIZE_ATTRIBUTE_ELEMS: ["TABLE", "TH", "TD", "HR", "PRE"],

  // The commented out elements qualify as phrasing content but tend to be
  // removed by readability when put into paragraphs, so we ignore them here.
  PHRASING_ELEMS: [
    // "CANVAS", "IFRAME", "SVG", "VIDEO",
    "ABBR", "AUDIO", "B", "BDO", "BR", "BUTTON", "CITE", "CODE", "DATA",
    "DATALIST", "DFN", "EM", "EMBED", "I", "IMG", "INPUT", "KBD", "LABEL",
    "MARK", "MATH", "METER", "NOSCRIPT", "OBJECT", "OUTPUT", "PROGRESS", "Q",
    "RUBY", "SAMP", "SCRIPT", "SELECT", "SMALL", "SPAN", "STRONG", "SUB",
    "SUP", "TEXTAREA", "TIME", "VAR", "WBR"
  ],

  // These are the classes that we want to keep.
  CLASSES_TO_PRESERVE: [
    "page", "twitter-tweet", "tweet-placeholder", "instagram-placeholder", "morning-brew-markets", "prism-code", "tiktok-embed"
  ],

  // Classes of placeholder elements that can be empty but shouldn't be removed
  PLACEHOLDER_CLASSES: ['tweet-placeholder', 'instagram-placeholder'],

  // Classes of embeds extracted by the extension
  EMBEDS_CLASSES: ['omnivore-instagram-embed'],

  // These are the list of HTML entities that need to be escaped.
  HTML_ESCAPE_MAP: {
    "lt": "<",
    "gt": ">",
    "amp": "&",
    "quot": '"',
    "apos": "'",
  },

  // These are the classes that we skip when cleaning a tag
  CLASSES_TO_SKIP: ["post-body", "StoryBodyCompanionColumn"],

  /**
   * Run any post-process modifications to article content as necessary.
   *
   * @param Element
   * @return void
   **/
  _postProcessContent: function (articleContent) {
    // Readability cannot open relative uris so we convert them to absolute uris.
    this._fixRelativeUris(articleContent);

    this._createImageProxyLinks(articleContent);

    this._simplifyNestedElements(articleContent);

    if (!this._keepClasses) {
      // Remove classes.
      this._cleanClasses(articleContent);
    }
  },

  /**
   * Iterates over a NodeList, calls `filterFn` for each node and removes node
   * if function returned `true`.
   *
   * If function is not passed, removes all the nodes in node list.
   *
   * @param NodeList nodeList The nodes to operate on
   * @param Function filterFn the function to use as a filter
   * @return void
   */
  _removeNodes: function (nodeList, filterFn) {
    // Avoid ever operating on live node lists.
    if (this._docJSDOMParser && nodeList._isLiveNodeList) {
      throw new Error("Do not pass live node lists to _removeNodes");
    }
    for (var i = nodeList.length - 1; i >= 0; i--) {
      var node = nodeList[i];
      var parentNode = node.parentNode;
      if (parentNode) {
        if (!filterFn || filterFn.call(this, node, i, nodeList)) {
          parentNode.removeChild(node);
        }
      }
    }
  },

  /**
   * Iterates over a NodeList, and calls _setNodeTag for each node.
   *
   * @param NodeList nodeList The nodes to operate on
   * @param String newTagName the new tag name to use
   * @return void
   */
  _replaceNodeTags: function (nodeList, newTagName) {
    // Avoid ever operating on live node lists.
    if (this._docJSDOMParser && nodeList._isLiveNodeList) {
      throw new Error("Do not pass live node lists to _replaceNodeTags");
    }
    for (const node of nodeList) {
      this._setNodeTag(node, newTagName);
    }
  },

  /**
   * Iterate over a NodeList, which doesn't natively fully implement the Array
   * interface.
   *
   * For convenience, the current object context is applied to the provided
   * iterate function.
   *
   * @param  NodeList nodeList The NodeList.
   * @param  Function fn       The iterate function.
   * @return void
   */
  _forEachNode: function (nodeList, fn) {
    Array.prototype.forEach.call(nodeList, fn, this);
  },

  /**
   * Iterate over a NodeList, and return the first node that passes
   * the supplied test function
   *
   * For convenience, the current object context is applied to the provided
   * test function.
   *
   * @param  NodeList nodeList The NodeList.
   * @param  Function fn       The test function.
   * @return void
   */
  _findNode: function (nodeList, fn) {
    return Array.prototype.find.call(nodeList, fn, this);
  },

  /**
   * Iterate over a NodeList, return true if any of the provided iterate
   * function calls returns true, false otherwise.
   *
   * For convenience, the current object context is applied to the
   * provided iterate function.
   *
   * @param  NodeList nodeList The NodeList.
   * @param  Function fn       The iterate function.
   * @return Boolean
   */
  _someNode: function (nodeList, fn) {
    return Array.prototype.some.call(nodeList, fn, this);
  },

  /**
   * Iterate over the attributes of the Element, return true if any of the provided iterate
   * function calls returns true, false otherwise.
   * @param {Element} node - Node to check for attributes
   * @param {function({name: string, value: string})} fn - The iterate function. Accepts object with name and value of the attribute
   */
  _someNodeAttribute: function (node, fn) {
    return (node.getAttributeNames && node.getAttributeNames() || []).map(name => ({
      name,
      value: node.getAttribute(name)
    })).some(fn)
  },

  /**
   * Iterate over a NodeList, return true if all of the provided iterate
   * function calls return true, false otherwise.
   *
   * For convenience, the current object context is applied to the
   * provided iterate function.
   *
   * @param  NodeList nodeList The NodeList.
   * @param  Function fn       The iterate function.
   * @return Boolean
   */
  _everyNode: function (nodeList, fn) {
    return Array.prototype.every.call(nodeList, fn, this);
  },

  /**
   * Concat all nodelists passed as arguments.
   *
   * @return ...NodeList
   * @return Array
   */
  _concatNodeLists: function () {
    var slice = Array.prototype.slice;
    var args = slice.call(arguments);
    var nodeLists = args.map(function (list) {
      return slice.call(list);
    });
    return Array.prototype.concat.apply([], nodeLists);
  },

  _getAllNodesWithTag: function (node, tagNames) {
    if (node.querySelectorAll) {
      return node.querySelectorAll(tagNames.join(","));
    }
    return [].concat.apply([], tagNames.map(function (tag) {
      var collection = node.getElementsByTagName(tag);
      return Array.isArray(collection) ? collection : Array.from(collection);
    }));
  },

  /**
   * Removes the class="" attribute from every element in the given
   * subtree, except those that match CLASSES_TO_PRESERVE and
   * the classesToPreserve array from the options object.
   *
   * @param Element
   * @return void
   */
  _cleanClasses: function (node) {
    if (node.className && node.className.startsWith && node.className.startsWith('_omnivore')) {
      return;
    }

    if (node.className && node.className.hasOwnProperty && node.className.hasOwnProperty('_omnivore')) {
      return;
    }

    if (this.EMBEDS_CLASSES.includes(node.className) || this.hasEmbed(node)) {
      return;
    }

    var classesToPreserve = this._classesToPreserve;
    var className = (node.getAttribute("class") || "")
      .split(/\s+/)
      .filter(function (cls) {
        return classesToPreserve.indexOf(cls) !== -1;
      })
      .join(" ");

    if (className) {
      node.setAttribute("class", className);
    } else {
      node.removeAttribute("class");
    }

    for (node = node.firstElementChild; node; node = node.nextElementSibling) {
      this._cleanClasses(node);
    }
  },

  toAbsoluteURI: function (uri) {
    var baseURI = this._baseURI;
    var documentURI = this._documentURI;

    // Leave hash links alone if the base URI matches the document URI:
    if (baseURI === documentURI && uri.charAt(0) === "#") {
      return uri;
    }

    // Otherwise, resolve against base URI:
    try {
      return new URL(uri, baseURI).href;
    } catch (ex) {
      // Something went wrong, just return the original:
    }
    return uri;
  },

  /**
   * Converts each <a> and <img> uri in the given element to an absolute URI,
   * ignoring #ref URIs.
   *
   * @param Element
   * @return void
   */
  _fixRelativeUris: function (articleContent) {
    var links = this._getAllNodesWithTag(articleContent, ["a"]);
    this._forEachNode(links, function (link) {
      var href = link.getAttribute("href");
      if (href) {
        // Remove links with javascript: URIs, since
        // they won't work after scripts have been removed from the page.
        if (href.indexOf("javascript:") === 0) {
          // if the link only contains simple text content, it can be converted to a text node
          if (link.childNodes.length === 1 && link.childNodes[0].nodeType === this.TEXT_NODE) {
            var text = this._doc.createTextNode(link.textContent);
            link.parentNode.replaceChild(text, link);
          } else {
            // if the link has multiple children, they should all be preserved
            var container = this._doc.createElement("span");
            while (link.firstChild) {
              container.appendChild(link.firstChild);
            }
            link.parentNode.replaceChild(container, link);
          }
        } else {
          link.setAttribute("href", this.toAbsoluteURI(href));
        }
      }
    });

    var medias = this._getAllNodesWithTag(articleContent, [
      "img", "picture", "figure", "video", "audio", "source"
    ]);

    this._forEachNode(medias, function (media) {
      var src = media.getAttribute("src");
      var poster = media.getAttribute("poster");
      var srcset = media.getAttribute("srcset");

      if (src) {
        media.setAttribute("src", this.toAbsoluteURI(src));
      }

      if (poster) {
        media.setAttribute("poster", this.toAbsoluteURI(poster));
      }
    });
  },

  /** Creates imageproxy links for all article images with href source */
  _createImageProxyLinks: function (articleContent) {
    if (this.createImageProxyUrl !== undefined) {
      const dataUriRegex = /^data:image\/(?:png|jpe?g|gif);base64,/;

      // replace all images' href source
      const images = articleContent.getElementsByTagName('img');
      Array.from(images).forEach(image => {
        // use data-src if lazy loading
        const src = image.getAttribute("data-src") || image.getAttribute("src");

        // do not proxy data uri
        if (src && !dataUriRegex.test(src)) {
          const absoluteSrc = this.toAbsoluteURI(src);
          const attToNumber = (str) => {
            if (!str) { return 0; }
            const res = parseInt(str);
            if (isNaN(res)) { return 0; }
            if (String(res) !== str) { return 0; }
            return res
          }

          const width = attToNumber(image.getAttribute('width') || image.style.width);
          const height = attToNumber(image.getAttribute('height') || image.style.height);

          const proxySrc = this.createImageProxyUrl(absoluteSrc, width, height);
          image.setAttribute('src', proxySrc);
          image.setAttribute('data-omnivore-original-src', absoluteSrc)
        }

        // remove crossorigin attribute to avoid CORS errors
        image.removeAttribute('crossorigin');
      });

      // replace all srcset's
      const elements = articleContent.querySelectorAll('[srcset]');
      Array.from(elements).forEach(element => {
        let resultSrcset = '';
        const srcSet = element.getAttribute('srcset')

        // If the srcset is a data image its probably just for lazy loading
        // so we want to remove it.
        if (dataUriRegex.test(srcSet) && element.getAttribute('src')) {
          element.removeAttribute('srcset');
          return;
        }

        const items = parseSrcset(srcSet);
        for (let item of items) {
          const { url: link, w, x, d } = item;
          if (!w && !x && !d) {
            const proxySrc = this.createImageProxyUrl(this.toAbsoluteURI(link));
            resultSrcset += `${proxySrc},`;
            continue;
          }

          // handle cases where width is described by value (e.g. 1080w)
          if (w) {
            const value = String(w);
            const proxySrc = this.createImageProxyUrl(this.toAbsoluteURI(link), +value);
            resultSrcset += `${proxySrc} ${w}w,`;
            continue;
          }

          // handle cases where width is described by multiplier (e.g. 2x)
          if (x) {
            const proxySrc = this.createImageProxyUrl(this.toAbsoluteURI(link));
            resultSrcset += `${proxySrc} ${x}x,`;
          }

          if (d) {
            const proxySrc = this.createImageProxyUrl(this.toAbsoluteURI(link));
            resultSrcset += `${proxySrc} ${d}x,`;
          }
        }

        element.setAttribute('srcset', resultSrcset);
      });
    }
  },

  _simplifyNestedElements: function (articleContent) {
    var node = articleContent;

    while (node) {
      if (this.PLACEHOLDER_CLASSES.includes(node.className) || this.hasEmbed(node) || this.isEmbed(node)) {
        node = this._getNextNode(node);
        continue;
      }

      // If we have a node with only one child element which has the placeholder class, keep it
      if (this._hasSingleTagInsideElement(node, "DIV") && this.PLACEHOLDER_CLASSES.includes(node.firstElementChild.className)) {
        node = this._getNextNode(node);
        continue;
      }

      if (node.parentNode && ["DIV", "SECTION"].includes(node.tagName) && !this._isOmnivoreNode(node) && !(node.id && node.id.startsWith("readability"))) {
        if (this._isElementWithoutContent(node)) {
          node = this._removeAndGetNext(node);
          continue;
        } else if (this._hasSingleTagInsideElement(node, "DIV") || this._hasSingleTagInsideElement(node, "SECTION")) {
          var child = node.children[0];
          for (var i = 0; i < node.attributes.length; i++) {
            child.setAttribute(node.attributes[i].name, node.attributes[i].value);
          }
          node.parentNode.replaceChild(child, node);
          node = child;
          continue;
        }
      }

      node = this._getNextNode(node);
    }
  },

  /**
   * Get the article title as an H1.
   *
   * @return string
   **/
  _getArticleTitle: function () {
    var doc = this._doc;
    var curTitle = "";
    var origTitle = "";

    try {
      curTitle = origTitle = doc.title.trim();

      // If they had an element with id "title" in their HTML
      if (typeof curTitle !== "string")
        curTitle = origTitle = this._getInnerText(doc.getElementsByTagName("title")[0]);
    } catch (e) {/* ignore exceptions setting the title. */
    }

    var titleHadHierarchicalSeparators = false;

    function wordCount(str) {
      return str.split(/\s+/).length;
    }

    // If there's a separator in the title, first remove the final part
    if ((/ [\|\-\\\/>»] /).test(curTitle)) {
      titleHadHierarchicalSeparators = / [\\\/>»] /.test(curTitle);
      curTitle = origTitle.replace(/(.*)[\|\-\\\/>»] .*/gi, "$1");

      // If the resulting title is too short (3 words or fewer), remove
      // the first part instead:
      if (wordCount(curTitle) < 3)
        curTitle = origTitle.replace(/[^\|\-\\\/>»]*[\|\-\\\/>»](.*)/gi, "$1");
    } else if (curTitle.indexOf(": ") !== -1) {
      // Check if we have an heading containing this exact string, so we
      // could assume it's the full title.
      var headings = this._concatNodeLists(
        doc.getElementsByTagName("h1"),
        doc.getElementsByTagName("h2")
      );
      var trimmedTitle = curTitle.trim();
      var match = this._someNode(headings, function (heading) {
        return heading.textContent.trim() === trimmedTitle;
      });

      // If we don't, let's extract the title out of the original title string.
      if (!match) {
        curTitle = origTitle.substring(origTitle.lastIndexOf(":") + 1);

        // If the title is now too short, try the first colon instead:
        if (wordCount(curTitle) < 3) {
          curTitle = origTitle.substring(origTitle.indexOf(":") + 1);
          // But if we have too many words before the colon there's something weird
          // with the titles and the H tags so let's just use the original title instead
        } else if (wordCount(origTitle.substr(0, origTitle.indexOf(":"))) > 5) {
          curTitle = origTitle;
        }
      }
    } else if (curTitle.length > 150 || curTitle.length < 15) {
      var hOnes = doc.getElementsByTagName("h1");

      if (hOnes.length === 1)
        curTitle = this._getInnerText(hOnes[0]);
    }

    curTitle = curTitle.trim().replace(this.REGEXPS.normalize, " ");
    // If we now have 4 words or fewer as our title, and either no
    // 'hierarchical' separators (\, /, > or ») were found in the original
    // title or we decreased the number of words by more than 1 word, use
    // the original title.
    var curTitleWordCount = wordCount(curTitle);
    if (curTitleWordCount <= 4 &&
      (!titleHadHierarchicalSeparators ||
        curTitleWordCount != wordCount(origTitle.replace(/[\|\-\\\/>»]+/g, "")) - 1)) {
      curTitle = origTitle;
    }

    return curTitle;
  },

  /**
   * Prepare the HTML document for readability to scrape it.
   * This includes things like stripping javascript, CSS, and handling terrible markup.
   *
   * @return void
   **/
  _prepDocument: function () {
    var doc = this._doc;

    // Remove all style tags in head
    this._removeNodes(this._getAllNodesWithTag(doc, ["style"]));

    if (doc.body) {
      this._replaceBrs(doc.body);
    }

    this._replaceNodeTags(this._getAllNodesWithTag(doc, ["font"]), "SPAN");
  },

  /**
   * Finds the next node, starting from the given node, and ignoring
   * whitespace in between. If the given node is an element, the same node is
   * returned.
   */
  _nextNode: function (node) {
    var next = node;
    while (next
    && (next.nodeType !== this.ELEMENT_NODE)
    && this.REGEXPS.whitespace.test(next.textContent)) {
      next = next.nextSibling;
    }
    return next;
  },

  /**
   * Replaces 2 or more successive <br> elements with a single <p>.
   * Whitespace between <br> elements are ignored. For example:
   *   <div>foo<br>bar<br> <br><br>abc</div>
   * will become:
   *   <div>foo<br>bar<p>abc</p></div>
   */
  _replaceBrs: function (elem) {
    this._forEachNode(this._getAllNodesWithTag(elem, ["br"]), function (br) {
      var next = br.nextSibling;

      // Whether 2 or more <br> elements have been found and replaced with a
      // <p> block.
      var replaced = false;

      // If we find a <br> chain, remove the <br>s until we hit another node
      // or non-whitespace. This leaves behind the first <br> in the chain
      // (which will be replaced with a <p> later).
      while ((next = this._nextNode(next)) && (next.tagName === "BR")) {
        replaced = true;
        var brSibling = next.nextSibling;
        next.parentNode.removeChild(next);
        next = brSibling;
      }

      // If we removed a <br> chain, replace the remaining <br> with a <p>. Add
      // all sibling nodes as children of the <p> until we hit another <br>
      // chain.
      if (replaced) {
        var p = this._doc.createElement("p");
        br.parentNode.replaceChild(p, br);

        next = p.nextSibling;
        while (next) {
          // If we've hit another <br><br>, we're done adding children to this <p>.
          if (next.tagName == "BR") {
            var nextElem = this._nextNode(next.nextSibling);
            if (nextElem && nextElem.tagName == "BR")
              break;
          }

          if (!this._isPhrasingContent(next))
            break;

          // Otherwise, make this node a child of the new <p>.
          var sibling = next.nextSibling;
          p.appendChild(next);
          next = sibling;
        }

        while (p.lastChild && this._isWhitespace(p.lastChild)) {
          p.removeChild(p.lastChild);
        }

        if (p.parentNode.tagName === "P")
          this._setNodeTag(p.parentNode, "DIV");
      }
    });
  },

  _setNodeTag: function (node, tag) {
    this.log("_setNodeTag", node, tag);
    if (this._docJSDOMParser) {
      node.localName = tag.toLowerCase();
      node.tagName = tag.toUpperCase();
      return node;
    }

    var replacement = node.ownerDocument.createElement(tag);
    while (node.firstChild) {
      replacement.appendChild(node.firstChild);
    }
    node.parentNode.replaceChild(replacement, node);
    if (node.readability)
      replacement.readability = node.readability;

    for (var i = 0; i < node.attributes.length; i++) {
      try {
        replacement.setAttribute(node.attributes[i].name, node.attributes[i].value);
      } catch (ex) {
        /* it's possible for setAttribute() to throw if the attribute name
         * isn't a valid XML Name. Such attributes can however be parsed from
         * source in HTML docs, see https://github.com/whatwg/html/issues/4275,
         * so we can hit them here and then throw. We don't care about such
         * attributes so we ignore them.
         */
      }
    }
    return replacement;
  },

  /**
   * Prepare the article node for display. Clean out any inline styles,
   * iframes, forms, strip extraneous <p> tags, etc.
   *
   * @param Element
   * @return void
   **/
  _prepArticle: async function (articleContent) {
    if (this._keepTables) {
      // replace tables which is not a preserve class with divs for newsletters
      this._replaceNodeTags(this._getAllNodesWithTag(articleContent, ["table"]).filter(t => !this._classesToPreserve.includes(t.className)), "div");
    }
    await this._createPlaceholders(articleContent);
    this._cleanStyles(articleContent);
    // Check for data tables before we continue, to avoid removing items in
    // those tables, which will often be isolated even though they're
    // visually linked to other content-ful elements (text, images, etc.).
    this._markDataTables(articleContent);

    this._fixLazyImages(articleContent);

    // Clean out junk from the article content
    this._cleanConditionally(articleContent, "form");
    this._cleanConditionally(articleContent, "fieldset");
    this._clean(articleContent, "object");
    this._clean(articleContent, "embed");
    this._clean(articleContent, "footer");
    this._clean(articleContent, "link");
    this._clean(articleContent, "aside");

    // Clean out elements with little content that have "share" in their id/class combinations from final top candidates,
    // which means we don't remove the top candidates even they have "share".

    var shareElementThreshold = this.DEFAULT_CHAR_THRESHOLD;

    this._forEachNode(articleContent.children, function (topCandidate) {
      this._cleanMatchedNodes(topCandidate, function (node, matchString) {
        if (this.REGEXPS.shareElements.test(matchString) && node.textContent.length < shareElementThreshold) {
          // Prevent removing images that have width more than 100 pixels
          // Example article - https://www.dailymail.co.uk/news/article-8868177/Pregnant-Katharine-McPhee-David-Foster-house-hunting-Harry-Meghans-Montecito-enclave.html
          // dailymail are using 'share' as a part of a class name of every image
          return !(node.tagName === 'IMG' && parseInt(node.getAttribute('width')) > 100);
        }
      });
    });

    this._clean(articleContent, "iframe");
    this._clean(articleContent, "input");
    this._clean(articleContent, "textarea");
    this._clean(articleContent, "select");
    this._cleanConditionally(articleContent, "button");
    this._cleanHeaders(articleContent);

    // Do these last as the previous stuff may have removed junk
    // that will affect these
    this._cleanConditionally(articleContent, "table");
    this._cleanConditionally(articleContent, "ul");
    this._cleanConditionally(articleContent, "div");

    // replace H1 with H2 as H1 should be only title that is displayed separately
    this._replaceNodeTags(this._getAllNodesWithTag(articleContent, ["h1"]), "h2");

    // Remove extra paragraphs
    this._removeNodes(this._getAllNodesWithTag(articleContent, ["p"]), function (paragraph) {
      var imgCount = paragraph.getElementsByTagName("img").length;
      var embedCount = paragraph.getElementsByTagName("embed").length;
      var objectCount = paragraph.getElementsByTagName("object").length;
      // At this point, nasty iframes have been removed, only remain embedded video ones.
      var iframeCount = paragraph.getElementsByTagName("iframe").length;
      var totalCount = imgCount + embedCount + objectCount + iframeCount;

      // some websites might contain javascript carousels that are parsed like img + number of items in the carousel
      // example - https://www.dailymail.co.uk/news/article-8868177/Pregnant-Katharine-McPhee-David-Foster-house-hunting-Harry-Meghans-Montecito-enclave.html
      const hasRedundantImage = imgCount === 1 && /^\+\d+$/g.test(this._getInnerText(paragraph));

      return (totalCount === 0 &&
        !this._getInnerText(paragraph, false) &&
        !this.PLACEHOLDER_CLASSES.includes(paragraph.className)) || hasRedundantImage;
    });

    this._forEachNode(this._getAllNodesWithTag(articleContent, ["br"]), function (br) {
      var next = this._nextNode(br.nextSibling);
      if (next && next.tagName == "P")
        br.parentNode.removeChild(br);
    });

    // Remove single-cell tables
    this._forEachNode(this._getAllNodesWithTag(articleContent, ["table"]), function (table) {
      var tbody = this._hasSingleTagInsideElement(table, "TBODY") ? table.firstElementChild : table;
      if (this._hasSingleTagInsideElement(tbody, "TR")) {
        var row = tbody.firstElementChild;
        if (this._hasSingleTagInsideElement(row, "TD")) {
          var cell = row.firstElementChild;
          cell = this._setNodeTag(cell, this._everyNode(cell.childNodes, this._isPhrasingContent) ? "P" : "DIV");
          table.parentNode.replaceChild(cell, table);
        }
      }
    });

    // Final clean up of nodes that might pass readability conditions but still contain redundant text
    // For example, this article (https://www.sciencedirect.com/science/article/abs/pii/S0047248498902196)
    // has a "View full text" anchor at the bottom of the page
    this._removeNodes(this._getAllNodesWithTag(articleContent, ["a"]), function (anchor) {
      const possibleRedundantText = /view full|skip to content|Open in browser/ig;
      const innerText = this._getInnerText(anchor);
      // also removes anchors class names that contain 'tw-text-substack-secondary' as they are used for Substack subscription
      const possibleRedundantClassName = 'tw-text-substack-secondary'
      const className = anchor.className;
      return (possibleRedundantText.test(innerText) && innerText.length <= 30) || className.includes(possibleRedundantClassName);
    });
  },

  /**
   * Initialize a node with the readability object. Also checks the
   * className/id for special names to add to its score.
   *
   * @param Element
   * @return void
   **/
  _initializeNode: function (node) {
    node.readability = {"contentScore": 0};

    switch (node.tagName) {
      case "DIV":
        node.readability.contentScore += 5;
        break;

      case "PRE":
      case "TD":
      case "BLOCKQUOTE":
        node.readability.contentScore += 3;
        break;

      case "ADDRESS":
      case "OL":
      case "UL":
      case "DL":
      case "DD":
      case "DT":
      case "LI":
      case "FORM":
        node.readability.contentScore -= 3;
        break;

      case "H1":
      case "H2":
      case "H3":
      case "H4":
      case "H5":
      case "H6":
      case "TH":
        node.readability.contentScore -= 5;
        break;
    }

    node.readability.contentScore += this._getClassWeight(node);
  },

  _removeAndGetNext: function (node) {
    var nextNode = this._getNextNode(node, true);
    node.parentNode.removeChild(node);
    return nextNode;
  },

  /**
   * Traverse the DOM from node to node, starting at the node passed in.
   * Pass true for the second parameter to indicate this node itself
   * (and its kids) are going away, and we want the next node over.
   *
   * Calling this in a loop will traverse the DOM depth-first.
   */
  _getNextNode: function (node, ignoreSelfAndKids) {
    // First check for kids if those aren't being ignored
    if (!ignoreSelfAndKids && node.firstElementChild) {
      return node.firstElementChild;
    }
    // Then for siblings...
    if (node.nextElementSibling) {
      return node.nextElementSibling;
    }
    // And finally, move up the parent chain *and* find a sibling
    // (because this is depth-first traversal, we will have already
    // seen the parent nodes themselves).
    do {
      node = node.parentNode;
    } while (node && !node.nextElementSibling);
    return node && node.nextElementSibling;
  },

  // compares second text to first one
  // 1 = same text, 0 = completely different text
  // works the way that it splits both texts into words and then finds words that are unique in second text
  // the result is given by the lower length of unique parts
  _textSimilarity: function (textA, textB) {
    const DISTANCE_WEIGHT = 0.618;
    const tokensA = textA.toLowerCase().split(this.REGEXPS.tokenize).filter(Boolean);
    const tokensB = textB.toLowerCase().split(this.REGEXPS.tokenize).filter(Boolean);
    if (!tokensA.length || !tokensB.length) {
      return 0;
    }
    const {uniqTokensB, similarTokensB} = tokensB.reduce((res, token) => {
      if (tokensA.includes(token)) {
        res.similarTokensB.push(token);
      } else {
        res.uniqTokensB.push(token);
      }
      return res;
    }, {similarTokensB: [], uniqTokensB: []});
    const distanceB = uniqTokensB.join(" ").length / tokensB.join(" ").length;
    const lengthDistance = similarTokensB.join(" ").length / tokensA.join(" ").length;
    return DISTANCE_WEIGHT * (1 - distanceB) + lengthDistance * (1 - DISTANCE_WEIGHT);
  },

  _checkPublishedDate: function (node, matchString) {
    // Skipping meta tags
    if (node.tagName.toLowerCase() === 'meta') return
    // return published date if the class name is 'omnivore-published-date' which we added when we scraped the article
    if (node.className === 'omnivore-published-date' && this._isValidPublishedDate(node.textContent)) {
      return new Date(node.textContent);
    }
    // we don't want to check for dates in the URL's
    if (node.tagName.toLowerCase() === 'a') return
    // get the datetime from time element
    if (node.tagName.toLowerCase() === 'time') {
      const datetime = node.getAttribute('datetime')
      if (datetime) {
        const date = new Date(datetime)
        if (!isNaN(date)) {
          this._articlePublishedDate = date
          return true
        }
      }
    }
        
    // Searching for the real date in the text content
    const content = node.textContent.trim()
    let dateFound
    const dateRegExpFound = this.REGEXPS.DATES_REGEXPS.find(regexp => regexp.test(content))
    if (dateRegExpFound) {
      dateFound = dateRegExpFound.exec(content)[0]
    } else if (this.REGEXPS.LONG_DATE_REGEXP.test(content)) {
      dateFound = this.REGEXPS.LONG_DATE_REGEXP.exec(content)[0].replace(/st|nd|rd|th/i, '')
    } else if (this.REGEXPS.CHINESE_DATE_REGEXP.test(content)) {
      dateFound = this.REGEXPS.CHINESE_DATE_REGEXP.exec(content)[0].replace(/年|月/g, '-').replace(/日/g, '')
    }

    let publishedDateParsed
    try {
      // Trying to parse the Date from the content itself
      publishedDateParsed = new Date(content)
    } catch (error) { }

    if (
      // Checking for the dates keywords through the attributes except URL's
      ((this._someNodeAttribute(node, ({ value, name }) => {
        if (/href|uri|url/i.test(name)) return false;
        return this.REGEXPS.publishedDate.test(value)
      }) || dateFound) || (/date/i.test(matchString) && !isNaN(publishedDateParsed)))
      && this._isValidPublishedDate(node.textContent)
    ) {
      try {
        if (isNaN(publishedDateParsed)) {
          // Trying to parse the Date from the found by REGEXP string
          publishedDateParsed = new Date(dateFound)
        }

        if (!isNaN(publishedDateParsed) && !this._articlePublishedDate)
          this._articlePublishedDate = publishedDateParsed
      }
      catch (error) { }
      return true;
    }
    return false;
  },

  _checkByline: function(node, matchString) {
    if (this._articleByline) {
      return false;
    }

    if (node.getAttribute !== undefined) {
      var rel = node.getAttribute("rel");
      var itemprop = node.getAttribute("itemprop");
    }

    if ((rel === "author" || itemprop && itemprop.indexOf("author") !== -1) || this.REGEXPS.byline.test(matchString)) {
      var allText = node.textContent.trim()
      var nameText = node.querySelector('span[itemprop="name"]')?.textContent
      const bylineText = nameText ?? allText
      if (this._isValidByline(bylineText)) {
        this._articleByline = bylineText
        return true;
      }
    }

    return false;
  },

  _getNodeAncestors: function (node, maxDepth) {
    maxDepth = maxDepth || 0;
    var i = 0, ancestors = [];
    while (node.parentNode) {
      ancestors.push(node.parentNode);
      if (maxDepth && ++i === maxDepth)
        break;
      node = node.parentNode;
    }
    return ancestors;
  },

  /***
   * grabArticle - Using a variety of metrics (content score, classname, element types), find the content that is
   *         most likely to be the stuff a user wants to read. Then return it wrapped up in a div.
   *
   * @param page a document to run upon. Needs to be a full document, complete with body.
   * @return Element
   **/
  _grabArticle: async function(page) {
    this.log("**** grabArticle ****");
    const doc = this._doc;
    const isPaging = page !== null;
    page = page ? page : this._doc.body;

    // We can't grab an article if we don't have a page!
    if (!page) {
      this.log("No body found in document. Abort.");
      return null;
    }

    var pageCacheHtml = page.innerHTML;

    while (true) {
      var stripUnlikelyCandidates = this._flagIsActive(this.FLAG_STRIP_UNLIKELYS);

      // First, node prepping. Trash nodes that look cruddy (like ones with the
      // class name "comment", etc), and turn divs into P tags where they have been
      // used inappropriately (as in, where they contain no other block level elements.)
      var elementsToScore = [];
      var node = this._doc.documentElement;

      let shouldRemoveTitleHeader = true;

      while (node) {
        var matchString = node.className + " " + node.id;

        if (this._isOmnivoreNode(node)) {
          node = this._getNextNode(node);
          continue;
        }

        if (!this._isProbablyVisible(node)) {
          this.log("Removing hidden node - " + matchString);
          node = this._removeAndGetNext(node);
          continue;
        }

        // User is not able to see elements applied with both "aria-modal = true" and "role = dialog"
        if (node.getAttribute("aria-modal") == "true" && node.getAttribute("role") == "dialog") {
          node = this._removeAndGetNext(node);
          continue;
        }

        // Check to see if this node is a byline or published, and remove it if it is.
        if (this._checkByline(node, matchString) || this._checkPublishedDate(node, matchString)) {
          node = this._removeAndGetNext(node);
          continue;
        }

        if (shouldRemoveTitleHeader && this._headerDuplicatesTitle(node)) {
          const headingText = node.textContent.trim();
          const titleText = this._articleTitle.trim();
          this.log("Removing header: ", { headingText, titleText });
          shouldRemoveTitleHeader = false;
          // Replacing title with the heading if the title includes heading but heading is smaller
          // Example article: http://jsomers.net/i-should-have-loved-biology
          // Or if there is the specific attribute that we can lean on.
          // For example "headline" in this article - https://nymag.com/intelligencer/2020/12/four-seasons-total-landscaping-the-full-est-possible-story.html
          if ((titleText !== headingText && titleText.includes(headingText)) || this._someNodeAttribute(node, ({ value }) => value === 'headline')) {
            this.log('Replacing title with heading')
            this._articleTitle = headingText;
          }
          node = this._removeAndGetNext(node);
          continue;
        }

        // Remove unlikely candidates
        if (stripUnlikelyCandidates) {
          if (
            (this.REGEXPS.unlikelyCandidates.test(matchString) ||
              // Checking for the "data-testid" attribute as well for the NYTimes articles
              // Example article: https://www.nytimes.com/2021/03/31/world/americas/brazil-coronavirus-bolsonaro.html
              this.REGEXPS.unlikelyCandidates.test(node.dataset && node.dataset.testid) ||
              this.REGEXPS.unlikelyCandidates.test(node.getAttribute('aria-labelledby'))
            ) &&
            !this.REGEXPS.okMaybeItsACandidate.test(matchString) &&
            !/tweet(-\w+)?/i.test(matchString) &&
            !/instagram/i.test(matchString) &&
            !this.isEmbed(node) &&
            !this._hasAncestorTag(node, "table") &&
            !this._hasAncestorTag(node, "code") &&
            // Example article - https://www.bbc.com/future/article/20170817-nasas-ambitious-plan-to-save-earth-from-a-supervolcano
            // Blockquote removed text example: "the conclusion that the supervolcano threat"
            !this._hasAncestorTag(node, "blockquote", 1) &&
            // The article content has been stripped out because of the DIV wrapper that includes word "SideBar"
            // inside of his className. So added option to not strip the node that has an ARTICLE element inside.
            // Example article - https://www.bbc.com/news/world-us-canada-55298015
            !(this._getAllNodesWithTag(node, ["article"]).length === 1) &&
            node.tagName !== "BODY" &&
            node.tagName !== "A") {
            this.log("Removing unlikely candidate - " + matchString);
            node = this._removeAndGetNext(node);
            continue;
          }

          if (this.UNLIKELY_ROLES.includes(node.getAttribute("role"))) {
            this.log("Removing content with role " + node.getAttribute("role") + " - " + matchString);
            node = this._removeAndGetNext(node);
            continue;
          }
        }

        // skip content modifications with embeds
        if (this.EMBEDS_CLASSES.includes(node.className) || this.isEmbed(node) || this.hasEmbed(node)) {
          node = this._getNextNode(node);
          continue;
        }

        // Remove DIV, SECTION, and HEADER nodes without any content(e.g. text, image, video, or iframe).
        if ((node.tagName === "DIV" || node.tagName === "SECTION" || node.tagName === "HEADER" ||
            node.tagName === "H1" || node.tagName === "H2" || node.tagName === "H3" ||
            node.tagName === "H4" || node.tagName === "H5" || node.tagName === "H6") &&
          this._isElementWithoutContent(node)) {
          node = this._removeAndGetNext(node);
          continue;
        }

        // Remove any container that's placed right before the h1 and most if its content is links
        if (node.nextElementSibling && node.nextElementSibling.tagName === 'H1' && this._getLinkDensity(node) > 0.5) {
          if (node.nextElementSibling.innerHTML === doc.getElementsByTagName('h1')[0].innerHTML) {
            node = this._removeAndGetNext(node);
            continue;
          }
        }

        if (this.DEFAULT_TAGS_TO_SCORE.indexOf(node.tagName) !== -1) {
          elementsToScore.push(node);
        }

        // Turn all divs that don't have children block level elements into p's
        if (node.tagName === "DIV") {
          // Put phrasing content into paragraphs.
          var p = null;
          var childNode = node.firstChild;
          while (childNode) {
            var nextSibling = childNode.nextSibling;
            if (this._isPhrasingContent(childNode)) {
              if (p !== null) {
                p.appendChild(childNode);
              } else if (!this._isWhitespace(childNode)) {
                p = doc.createElement("p");
                node.replaceChild(p, childNode);
                p.appendChild(childNode);
              }
            } else if (p !== null) {
              while (p.lastChild && this._isWhitespace(p.lastChild)) {
                p.removeChild(p.lastChild);
              }
              p = null;
            }
            childNode = nextSibling;
          }

          // Sites like http://mobile.slate.com encloses each paragraph with a DIV
          // element. DIVs with only a P element inside and no text content can be
          // safely converted into plain P elements to avoid confusing the scoring
          // algorithm with DIVs with are, in practice, paragraphs.
          if (this._hasSingleTagInsideElement(node, "P") && this._getLinkDensity(node) < 0.25) {
            var newNode = node.children[0];
            node.parentNode.replaceChild(newNode, node);
            node = newNode;
            elementsToScore.push(node);
          } else if (!this._hasChildBlockElement(node)) {
            node = this._setNodeTag(node, "P");
            elementsToScore.push(node);
          }
        }
        node = this._getNextNode(node);
      }

      /**
       * Loop through all paragraphs, and assign a score to them based on how content-y they look.
       * Then add their score to their parent node.
       *
       * A score is determined by things like number of commas, class names, etc. Maybe eventually link density.
       **/
      var candidates = [];
      this._forEachNode(elementsToScore, function(elementToScore) {
        if (!elementToScore.parentNode || typeof (elementToScore.parentNode.tagName) === "undefined")
          return;

        // If this paragraph is less than 25 characters, don't even count it.
        var innerText = this._getInnerText(elementToScore);
        if (innerText.length < 25)
          return;

        // Exclude nodes with no ancestor.
        var ancestors = this._getNodeAncestors(elementToScore, 5);
        if (ancestors.length === 0)
          return;

        var contentScore = 0;

        // Add a point for the paragraph itself as a base.
        contentScore += 1;

        // Add points for any commas within this paragraph.
        contentScore += innerText.split(this.REGEXPS.commas).length;

        // For every 100 characters in this paragraph, add another point. Up to 3 points.
        contentScore += Math.min(Math.floor(innerText.length / 100), 3);

        // Initialize and score ancestors.
        this._forEachNode(ancestors, function(ancestor, level) {
          if (!ancestor.tagName || !ancestor.parentNode || typeof (ancestor.parentNode.tagName) === "undefined")
            return;

          if (typeof (ancestor.readability) === "undefined") {
            this._initializeNode(ancestor);
            candidates.push(ancestor);
          }

          // Node score divider:
          // - parent:             1 (no division)
          // - grandparent:        2
          // - great grandparent+: ancestor level * 3
          if (level === 0)
            var scoreDivider = 1;
          else if (level === 1)
            scoreDivider = 2;
          else
            scoreDivider = level * 3;
          ancestor.readability.contentScore += contentScore / scoreDivider;
        });
      });

      // After we've calculated scores, loop through all of the possible
      // candidate nodes we found and find the one with the highest score.
      var topCandidates = [];
      for (var c = 0, cl = candidates.length; c < cl; c += 1) {
        var candidate = candidates[c];

        // Scale the final candidates score based on link density. Good content
        // should have a relatively small link density (5% or less) and be mostly
        // unaffected by this operation.
        var candidateScore = candidate.readability.contentScore * (1 - this._getLinkDensity(candidate));
        candidate.readability.contentScore = candidateScore;

        this.log("Candidate:", candidate.nodeName, candidate.className, "with score " + candidateScore);

        for (var t = 0; t < this._nbTopCandidates; t++) {
          var aTopCandidate = topCandidates[t];

          if (!aTopCandidate || candidateScore > aTopCandidate.readability.contentScore) {
            topCandidates.splice(t, 0, candidate);
            if (topCandidates.length > this._nbTopCandidates)
              topCandidates.pop();
            break;
          }
        }
      }

      var topCandidate = topCandidates[0] || null;
      var neededToCreateTopCandidate = false;
      var parentOfTopCandidate;

      // If we still have no top candidate, just use the body as a last resort.
      // We also have to copy the body node so it is something we can modify.
      if (topCandidate === null || topCandidate.tagName === "BODY") {
        // Move all of the page's children into topCandidate
        topCandidate = doc.createElement("DIV");
        neededToCreateTopCandidate = true;
        // Move everything (not just elements, also text nodes etc.) into the container
        // so we even include text directly in the body:
        while (page.firstChild) {
          this.log("Moving child out:", page.firstChild);
          topCandidate.appendChild(page.firstChild);
        }

        page.appendChild(topCandidate);

        this._initializeNode(topCandidate);
      } else if (topCandidate) {
        // Find a better top candidate node if it contains (at least three) nodes which belong to `topCandidates` array
        // and whose scores are quite closed with current `topCandidate` node.
        var alternativeCandidateAncestors = [];
        for (var i = 1; i < topCandidates.length; i++) {
          if (topCandidates[i].readability.contentScore / topCandidate.readability.contentScore >= 0.75) {
            alternativeCandidateAncestors.push(this._getNodeAncestors(topCandidates[i]));
          }
        }
        var MINIMUM_TOPCANDIDATES = 3;
        if (alternativeCandidateAncestors.length >= MINIMUM_TOPCANDIDATES) {
          parentOfTopCandidate = topCandidate.parentNode;
          while (parentOfTopCandidate.tagName !== "BODY") {
            var listsContainingThisAncestor = 0;
            for (var ancestorIndex = 0; ancestorIndex < alternativeCandidateAncestors.length && listsContainingThisAncestor < MINIMUM_TOPCANDIDATES; ancestorIndex++) {
              listsContainingThisAncestor += Number(alternativeCandidateAncestors[ancestorIndex].includes(parentOfTopCandidate));
            }
            if (listsContainingThisAncestor >= MINIMUM_TOPCANDIDATES) {
              topCandidate = parentOfTopCandidate;
              break;
            }
            parentOfTopCandidate = parentOfTopCandidate.parentNode;
          }
        }
        if (!topCandidate.readability) {
          this._initializeNode(topCandidate);
        }

        // Because of our bonus system, parents of candidates might have scores
        // themselves. They get half of the node. There won't be nodes with higher
        // scores than our topCandidate, but if we see the score going *up* in the first
        // few steps up the tree, that's a decent sign that there might be more content
        // lurking in other places that we want to unify in. The sibling stuff
        // below does some of that - but only if we've looked high enough up the DOM
        // tree.
        parentOfTopCandidate = topCandidate.parentNode;
        var lastScore = topCandidate.readability.contentScore;
        // The scores shouldn't get too low.
        var scoreThreshold = lastScore / 3;
        while (parentOfTopCandidate.tagName !== "BODY") {
          // Stopping parentCandidates searching if nav bar has been found as a sibling node
          if (Array.from(parentOfTopCandidate.parentNode.childNodes).some(n => n.tagName === "NAV")) {
            break;
          }
          if (!parentOfTopCandidate.readability) {
            parentOfTopCandidate = parentOfTopCandidate.parentNode;
            continue;
          }
          const parentScore = parentOfTopCandidate.readability.contentScore;
          if (parentScore < scoreThreshold) {
            break;
          }
          if (parentScore > lastScore) {
            // Alright! We found a better parent to use.
            topCandidate = parentOfTopCandidate;
            break;
          }
          lastScore = parentOfTopCandidate.readability.contentScore;
          parentOfTopCandidate = parentOfTopCandidate.parentNode;
        }

        // If the top candidate is the only child, use parent instead. This will help sibling
        // joining logic when adjacent content is actually located in parent's sibling node.
        while (parentOfTopCandidate.tagName !== "BODY" && parentOfTopCandidate.children.length === 1) {
          topCandidate = parentOfTopCandidate;
          parentOfTopCandidate = topCandidate.parentNode;
        }
        if (!topCandidate.readability) {
          this._initializeNode(topCandidate);
        }

        // fix is here, keep the best of previously found wrappers as a parent
        if (parentOfTopCandidate.tagName !== 'BODY') {
          topCandidate = parentOfTopCandidate
          this._initializeNode(topCandidate);
        }
      }

      // Now that we have the top candidate, look through its siblings for content
      // that might also be related. Things like preambles, content split by ads
      // that we removed, etc.
      var articleContent = doc.createElement("DIV");
      if (isPaging)
        articleContent.id = "readability-content";

      var siblingScoreThreshold = Math.max(10, (topCandidate.readability?.contentScore || 0) * 0.2);
      // Keep potential top candidate's parent node to try to get text direction of it later.
      parentOfTopCandidate = topCandidate.parentNode;
      var siblings = parentOfTopCandidate.children;

      for (var s = 0, sl = siblings.length; s < sl; s++) {
        var sibling = siblings[s];
        var append = false;

        this.log("Looking at sibling node:", sibling.nodeName, sibling.className, sibling.readability ? ("with score " + sibling.readability.contentScore) : "");
        this.log("Sibling has score", sibling.readability ? sibling.readability.contentScore : "Unknown");

        if (sibling === topCandidate) {
          append = true;
        } else {
          var contentBonus = 0;

          // Give a bonus if sibling nodes and top candidates have the example same classname
          if (sibling.className === topCandidate.className && topCandidate.className !== "") {
            contentBonus += topCandidate.readability.contentScore * 0.2;
          }

          if (sibling.readability &&
            ((sibling.readability.contentScore + contentBonus) >= siblingScoreThreshold)) {
            append = true;
          } else if (sibling.nodeName === "P") {
            var linkDensity = this._getLinkDensity(sibling);
            var nodeContent = this._getInnerText(sibling);
            var nodeLength = nodeContent.length;

            if (nodeLength > 80 && linkDensity < 0.25) {
              append = true;
            } else if (nodeLength < 80 && nodeLength > 0 && linkDensity === 0 &&
              nodeContent.search(/\.( |$)/) !== -1) {
              append = true;
            }
          }
        }

        if (append) {
          this.log("Appending node:", sibling.nodeName);

          if (this.ALTER_TO_DIV_EXCEPTIONS.indexOf(sibling.nodeName) === -1) {
            // We have a node that isn't a common block level element, like a form or td tag.
            // Turn it into a div so it doesn't get filtered out later by accident.
            this.log("Altering sibling:", sibling, "to div.");

            sibling = this._setNodeTag(sibling, "DIV");
          }

          articleContent.appendChild(sibling);
          // Fetch children again to make it compatible
          // with DOM parsers without live collection support.
          siblings = parentOfTopCandidate.children;
          // siblings is a reference to the children array, and
          // sibling is removed from the array when we call appendChild().
          // As a result, we must revisit this index since the nodes
          // have been shifted.
          s -= 1;
          sl -= 1;
        }
      }

      // Checking for the figures inside of the <header> tags and appending them to the content if not there aleady,
      // b/c some articles contains first image nested into the <header> elemens that is not considered as an article content at all.
      // Example article: https://www.vanityfair.com/news/2020/12/trump-vaccine-summit-herd-immunity
      const headerNodes = this._doc.documentElement && this._getAllNodesWithTag(this._doc.documentElement, ['HEADER']);
      const alreadyExistingFigures = this._getAllNodesWithTag(articleContent, ['FIGURE']);
      headerNodes && this._forEachNode(headerNodes, headerNode => {
        if (!headerNode || !headerNode.readability || !headerNode.readability.contentScore)
          return;

        const figures = this._getAllNodesWithTag(headerNode, ['FIGURE']);
        this._forEachNode(figures, figure => {
          if (!this._someNode(alreadyExistingFigures, existingFigure => existingFigure === figure)) {
            this.log(`Prepending figure to the article`, { className: figure.className, scr: figure.src })
            articleContent.prepend(figure)
          }
        })
      })

      if (this._debug)
        this.log("Article content pre-prep: ", { content: articleContent.innerHTML });
      // So we have all of the content that we need. Now we clean it up for presentation.
      await this._prepArticle(articleContent);

      if (this._debug)
        this.log("Article content post-prep: ", { content: articleContent.innerHTML });

      if (neededToCreateTopCandidate) {
        // We already created a fake div thing, and there wouldn't have been any siblings left
        // for the previous loop, so there's no point trying to create a new div, and then
        // move all the children over. Just assign IDs and class names here. No need to append
        // because that already happened anyway.
        topCandidate.id = "readability-page-1";
        topCandidate.className = "page";
      } else {
        var div = doc.createElement("DIV");
        div.id = "readability-page-1";
        div.className = "page";
        while (articleContent.firstChild) {
          div.appendChild(articleContent.firstChild);
        }
        articleContent.appendChild(div);
      }

      if (this._debug)
        this.log("Article content after paging: " + articleContent.innerHTML);

      var parseSuccessful = true;

      // Now that we've gone through the full algorithm, check to see if
      // we got any meaningful content. If we didn't, we may need to re-run
      // grabArticle with different flags set. This gives us a higher likelihood of
      // finding the content, and the sieve approach gives us a higher likelihood of
      // finding the -right- content.
      var textLength = this._getInnerText(articleContent, true).length;
      if (textLength < this._charThreshold) {
        parseSuccessful = false;
        page.innerHTML = pageCacheHtml;

        if (this._flagIsActive(this.FLAG_STRIP_UNLIKELYS)) {
          this._removeFlag(this.FLAG_STRIP_UNLIKELYS);
          this._attempts.push({ articleContent: articleContent, textLength: textLength });
        } else if (this._flagIsActive(this.FLAG_WEIGHT_CLASSES)) {
          this._removeFlag(this.FLAG_WEIGHT_CLASSES);
          this._attempts.push({ articleContent: articleContent, textLength: textLength });
        } else if (this._flagIsActive(this.FLAG_CLEAN_CONDITIONALLY)) {
          this._removeFlag(this.FLAG_CLEAN_CONDITIONALLY);
          this._attempts.push({ articleContent: articleContent, textLength: textLength });
        } else {
          this._attempts.push({ articleContent: articleContent, textLength: textLength });
          // No luck after removing flags, just return the longest text we found during the different loops
          this._attempts.sort(function(a, b) {
            return b.textLength - a.textLength;
          });

          // But first check if we actually have something
          if (!this._attempts[0].textLength && !this._attempts[0].articleContent) {
            return null;
          }

          articleContent = this._attempts[0].articleContent;
          parseSuccessful = true;
        }
      }

      if (parseSuccessful) {
        // Find out text direction from ancestors of final top candidate.
        var ancestors = [parentOfTopCandidate, topCandidate].concat(this._getNodeAncestors(parentOfTopCandidate));
        this._someNode(ancestors, function(ancestor) {
          if (!ancestor.tagName)
            return false;
          var articleDir = ancestor.getAttribute("dir");
          if (articleDir) {
            this._articleDir = articleDir;
            return true;
          }
          return false;
        });
        return articleContent;
      }
    }
  },

  /**
   * Check whether the input string could be a byline.
   * This verifies that the input is a string, and that the length
   * is less than 100 chars.
   *
   * @param possibleByline {string} - a string to check whether its a byline.
   * @return Boolean - whether the input string is a byline.
   */
  _isValidByline: function (byline) {
    if (typeof byline == "string" || byline instanceof String) {
      byline = byline.trim();
      return (byline.length > 0) && (byline.length < 100);
    }
    return false;
  },

  /**
   * Check whether the input string could be a published date.
   * This verifies that the input is a string, and that the length
   * is less than 100 chars.
   *
   * @param possiblePublishedDate {string} - a string to check whether its a published date.
   * @return Boolean - whether the input string is a published date.
   */
  _isValidPublishedDate: function(publishedDate) {
    if (typeof publishedDate == "string" || publishedDate instanceof String) {
      publishedDate = publishedDate.trim();
      return (publishedDate.length > 0) && (publishedDate.length < 50);
    }
    return false;
  },

  /**
   * Converts some of the common HTML entities in string to their corresponding characters.
   *
   * @param str {string} - a string to unescape.
   * @return string without HTML entity.
   */
  _unescapeHtmlEntities: function (str) {
    if (!str) {
      return str;
    }

    return htmlEntities.decode(str);
  },

  /**
   * Finds entity inside of the JSONLD graphs and returns value from the specified field
   * @param {object} parsedJSONLD - JSONLD parsed object to find inside
   * @param {string} id - id of the entity to find
   * @param {string} resultField - resulting field to grab value from
   * @returns {*} resulting field value
   * @example
   * this._findJSONLDRecordById(parsedData, "https://danwang.co/2020-letter/#primaryimage", "url")
   * // Finds "ImageObject" with specified ID and returns url of the image
   */
  _findJSONLDRecordById: function (parsedJSONLD, id, resultField) {
    if (!parsedJSONLD || !parsedJSONLD['@graph'] || !Array.isArray(parsedJSONLD['@graph']))
      return;

    const resultObject = parsedJSONLD['@graph'].find(it => it["@id"] === id);
    return resultObject && resultObject[resultField];
  },

  /**
   * Try to extract metadata from JSON-LD object.
   * For now, only Schema.org objects of type Article or its subtypes are supported.
   * @return Object with any metadata that could be extracted (possibly none)
   */
  _getJSONLD: function (doc) {
    const scripts = this._getAllNodesWithTag(doc, ["script"]);
    const jsonLdElements = [];

    // Parsing all JSONLD elements since the article might contain couple of them at once
    // Example article: https://nymag.com/intelligencer/2020/12/four-seasons-total-landscaping-the-full-est-possible-story.html
    this._forEachNode(scripts, function (el) {
      if (el.getAttribute("type") === "application/ld+json")
        jsonLdElements.push(el)
    })

    if (jsonLdElements.length) {
      try {
        // Strip CDATA markers if present
        const contents = jsonLdElements.map(el => el.textContent.replace(/^\s*<!\[CDATA\[|\]\]>\s*$/g, ""));
        let parsedData = {"@context": "https://schema.org", "@graph": []};
        contents.forEach(content => {
          let parsedContent = JSON.parse(content);

          if (Array.isArray(parsedContent))
            parsedData['@graph'] = parsedData['@graph'].concat(parsedContent)
          else
            parsedData['@graph'].push(parsedContent)
        })

        if (parsedData['@graph'].length === 1) parsedData = parsedData['@graph'][0]

        let parsedArticleInfo = parsedData;

        this.log(`JSONLD script found from ${scripts.length} scripts:`, {contents, parsed: parsedData})

        var metadata = {};
        if (
          !parsedData["@context"] ||
          !parsedData["@context"].match(/^https?\:\/\/schema\.org$/)
        ) {
          this.log(`Context hasn't matched!`, {context: parsedData["@context"]})
          return metadata;
        }

        if (!parsedData["@type"] && Array.isArray(parsedData["@graph"])) {
          parsedArticleInfo = parsedData["@graph"].find((it) => {
            return (it["@type"] || "").match(
              this.REGEXPS.jsonLdArticleTypes
            );
          });
          this.log(`Parsed after: `, {parsed: parsedArticleInfo})
        }

        if (typeof parsedArticleInfo.name === "string" && typeof parsedArticleInfo.headline === "string" && parsedArticleInfo.name !== parsedArticleInfo.headline) {
          // we have both name and headline element in the JSON-LD. They should both be the same but some websites like aktualne.cz
          // put their own name into "name" and the article title to "headline" which confuses Readability. So we try to check if either
          // "name" or "headline" closely matches the html title, and if so, use that one. If not, then we use "name" by default.

          var title = this._getArticleTitle();
          var nameMatches = this._textSimilarity(parsedArticleInfo.name, title) > 0.75;
          var headlineMatches = this._textSimilarity(parsedArticleInfo.headline, title) > 0.75;

          if (headlineMatches && !nameMatches) {
            metadata.title = parsedArticleInfo.headline;
          } else {
            metadata.title = parsedArticleInfo.name;
          }

        } else if (typeof parsedArticleInfo.name === "string") {
          metadata.title = parsedArticleInfo.name.trim();
        } else if (typeof parsedArticleInfo.headline === "string") {
          metadata.title = parsedArticleInfo.headline.trim();
        }
        if (parsedArticleInfo.author) {
          if (typeof parsedArticleInfo.author === 'string') {
            metadata.byline = parsedArticleInfo.author.trim();
          } else if (typeof parsedArticleInfo.author.name === "string") {
            metadata.byline = parsedArticleInfo.author.name.trim();
          } else if (Array.isArray(parsedArticleInfo.author) && parsedArticleInfo.author[0] && typeof parsedArticleInfo.author[0].name === "string") {
            metadata.byline = parsedArticleInfo.author
              .filter(function (author) {
                return author && typeof author.name === "string";
              })
              .map(function (author) {
                return author.name.trim();
              })
              .join(", ");
          } else if (parsedArticleInfo.author["@id"]) {
            metadata.byline = this._findJSONLDRecordById(parsedData, parsedArticleInfo.author["@id"], 'name')
          }
        }
        if (typeof parsedArticleInfo.description === "string") {
          metadata.excerpt = parsedArticleInfo.description.trim();
        }
        if (
          parsedArticleInfo.publisher &&
          typeof parsedArticleInfo.publisher.name === "string"
        ) {
          metadata.siteName = parsedArticleInfo.publisher.name.trim();
        }
        if (parsedArticleInfo.datePublished && typeof parsedArticleInfo.datePublished === 'string') {
          metadata.publishedDate = parsedArticleInfo.datePublished.trim();
        }
        if (typeof parsedArticleInfo.image === "string") {
          metadata.previewImage = parsedArticleInfo.image.trim();
        } else if (Array.isArray(parsedArticleInfo.image) && parsedArticleInfo.image[0] && typeof parsedArticleInfo.image[0] === 'string') {
          metadata.previewImage = parsedArticleInfo.image[0];
        } else if (parsedArticleInfo.image) {
          if (typeof parsedArticleInfo.image.url === 'string')
            metadata.previewImage = parsedArticleInfo.image.url.trim()
          else if (parsedArticleInfo.image["@id"])
            metadata.previewImage = this._findJSONLDRecordById(parsedData, parsedArticleInfo.image["@id"], 'url')
        }
        return metadata;
      } catch (err) {
        this.log(err.message);
      }
    }
    return {};
  },

  /**
   * Attempts to get excerpt and byline metadata for the article.
   *
   * @param {Object} jsonld — object containing any metadata that
   * could be extracted from JSON-LD object.
   *
   * @return Object with optional "excerpt" and "byline" properties
   */
  _getArticleMetadata: function (jsonld) {
    var metadata = {};
    var values = {};
    var metaElements = this._doc.getElementsByTagName("meta");

    // property is a space-separated list of values
    var propertyPattern =
      /\s*(dc|dcterm|og|twitter|article)\s*:\s*(locale|author|creator|description|title|site_name|published_time|published|date|image(?:$|\s|:url|:secure_url))\s*/gi;

    // name is a single value
    var namePattern = /^\s*(?:(dc|dcterm|og|twitter|weibo:(article|webpage))\s*[\.:]\s*)?(author|creator|description|title|site_name|date|image)\s*$/i;

    // Find description tags.
    this._forEachNode(metaElements, function (element) {
      var elementName = element.getAttribute("name");
      var elementProperty = element.getAttribute("property");
      var content = element.getAttribute("content");

      this.log(`______Meta tag review:`, `elementName: ${elementName}`, `elementProperty: ${elementProperty}`, `content: ${content}`);

      if (!content) {
        return;
      }
      var matches = null;
      var name = null;

      if (elementProperty) {
        matches = elementProperty.match(propertyPattern);
        if (matches) {
          // Convert to lowercase, and remove any whitespace
          // so we can match below.
          name = matches[0].toLowerCase().replace(/\s/g, "");

          // Only setting value for the images that is the valid URL address,
          // since it might find values like "og:image:height" which will match the RegExp
          // Article example: https://www.dailymail.co.uk/news/article-8868177/Pregnant-Katharine-McPhee-David-Foster-house-hunting-Harry-Meghans-Montecito-enclave.html
          if (name.includes('image')) {
            if (!isNaN(content.trim())) {
              /* skip width and height numbers */
              return;
            }
            try {
              // allow relative URLs
              new URL(content.trim(), new URL(this._baseURI).origin);
            } catch (error) {
              return;
            }
          }
          // multiple authors
          values[name] = content.trim();
        }
      }
      if (!matches && elementName && namePattern.test(elementName)) {
        name = elementName;
        if (content) {
          // Convert to lowercase, remove any whitespace, and convert dots
          // to colons so we can match below.
          name = name.toLowerCase().replace(/\s/g, "").replace(/\./g, ":");
          values[name] = content.trim();
        }
      }
    });

    // get title
    const titlesArray = [
      jsonld.title,
      values["twitter:title"],
      values["title"],
      values["dc:title"],
      values["dcterm:title"],
      values["og:title"],
      values["weibo:article:title"],
      values["weibo:webpage:title"]
    ];

    // Selecting shortest title from the titles array
    // For example: "Why Is Apple’s M1 Chip So Fast?" instead of "Why Is Apple’s M1 Chip So Fast? | Debugger"
    // Article example: https://debugger.medium.com/why-is-apples-m1-chip-so-fast-3262b158cba2
    metadata.title = titlesArray.reduce((res, example) => {
      if (!res || (example && res !== example && res.includes(example)))
        res = example;
      return res;
    });

    if (!metadata.title) {
      metadata.title = this._getArticleTitle();
      metadata.titleNotFoundFromMetainfo = true;
    }

    // get author
    metadata.byline = jsonld.byline ||
      values["dc:creator"] ||
      values["dcterm:creator"] ||
      values["author"];

    // get description
    metadata.excerpt = jsonld.excerpt ||
      values["twitter:description"] ||
      values["description"] ||
      values["dc:description"] ||
      values["dcterm:description"] ||
      values["og:description"] ||
      values["weibo:article:description"] ||
      values["weibo:webpage:description"];

    // get site name
    metadata.siteName = jsonld.siteName ||
      values["og:site_name"] || 
      values["twitter:site"] ||
      values["site_name"] ||
      values["twitter:domain"];

    // get website icon
    const siteIcon = this._doc.querySelector(
      "link[rel='apple-touch-icon'], link[rel='shortcut icon'], link[rel='icon']"
    );
    if (siteIcon) {
      const iconHref = siteIcon.getAttribute("href");
      if (iconHref) {
        if (this.REGEXPS.b64DataUrl.test(iconHref)) {
          // base64 encoded image
          metadata.siteIcon = iconHref;
        } else {
          // allow relative URLs
          metadata.siteIcon = this.toAbsoluteURI(iconHref);
        }
      }
    }

    // get published date
    metadata.publishedDate = jsonld.publishedDate ||
      values["date"] ||
      values["article:published_time"] ||
      values["article:published"] ||
      values["published_time"] ||
      values["published"] ||
      values["article:date"];

    // get preview image
    metadata.previewImage = values["image"] ||
      values["twitter:image"] ||
      values["dc:image"] ||
      values["dcterm:image"] ||
      values["og:image"] ||
      values["weibo:article:image"] ||
      values["weibo:webpage:image"] || 
      jsonld.previewImage;

    metadata.locale = values["og:locale"];

    // TODO: Add canonical ULR search here as well

    // in many sites the meta value is escaped with HTML entities,
    // so here we need to unescape it
    metadata.title = this._unescapeHtmlEntities(metadata.title);
    metadata.byline = this._unescapeHtmlEntities(metadata.byline);
    metadata.excerpt = this._unescapeHtmlEntities(metadata.excerpt);
    metadata.siteName = this._unescapeHtmlEntities(metadata.siteName);
    metadata.siteIcon = this._unescapeHtmlEntities(metadata.siteIcon);
    metadata.previewImage = this._unescapeHtmlEntities(metadata.previewImage);

    if (metadata.previewImage) {
      // convert any relative URL path to absolute URL
      try {
        metadata.previewImage = new URL(metadata.previewImage, new URL(this._baseURI).origin).href;
      } catch {
        delete metadata.previewImage;
      }
    }

    try {
      metadata.publishedDate = metadata.publishedDate && new Date(this._unescapeHtmlEntities(metadata.publishedDate))
      if (!(metadata.publishedDate instanceof Date) || isNaN(metadata.publishedDate)) {
        delete metadata.publishedDate
      }
    } catch {
      delete metadata.publishedDate
    }
    this.log(`___Metadata:`, {jsonld, values, metadata});

    return metadata;
  },

  /**
   * Check if node is image, or if node contains exactly only one image
   * whether as a direct child or as its descendants.
   *
   * @param Element
   **/
  _isSingleImage: function (node) {
    if (node.tagName === "IMG") {
      return true;
    }

    if (node.children.length !== 1 || node.textContent.trim() !== "") {
      return false;
    }

    return this._isSingleImage(node.children[0]);
  },

  /**
   * Find all <noscript> that are located after <img> nodes, and which contain only one
   * <img> element. Replace the first image with the image from inside the <noscript> tag,
   * and remove the <noscript> tag. This improves the quality of the images we use on
   * some sites (e.g. Medium).
   *
   * @param Element
   **/
  _unwrapNoscriptImages: function (doc) {
    // Find img without source or attributes that might contains image, and remove it.
    // This is done to prevent a placeholder img is replaced by img from noscript in next step.
    var imgs = Array.from(doc.getElementsByTagName("img"));
    this._forEachNode(imgs, function (img) {
      for (var i = 0; i < img.attributes.length; i++) {
        var attr = img.attributes[i];
        switch (attr.name) {
          case "src":
          case "srcset":
          case "data-src":
          case "data-srcset":
            return;
        }

        if (/\.(jpg|jpeg|png|webp)/i.test(attr.value)) {
          return;
        }
      }

      img.parentNode.removeChild(img);
    });

    // Next find noscript and try to extract its image
    var noscripts = Array.from(doc.getElementsByTagName("noscript"));
    this._forEachNode(noscripts, function (noscript) {
      // Parse content of noscript and make sure it only contains image
      var tmp = doc.createElement("div");
      tmp.innerHTML = noscript.innerHTML;
      if (!this._isSingleImage(tmp)) {
        return;
      }

      // If noscript has previous sibling and it only contains image,
      // replace it with noscript content. However we also keep old
      // attributes that might contains image.
      var prevElement = noscript.previousElementSibling;
      if (prevElement && this._isSingleImage(prevElement)) {
        var prevImg = prevElement;
        if (prevImg.tagName !== "IMG") {
          prevImg = prevElement.getElementsByTagName("img")[0];
        }

        var newImg = tmp.getElementsByTagName("img")[0];
        for (var i = 0; i < prevImg.attributes.length; i++) {
          var attr = prevImg.attributes[i];
          if (attr.value === "") {
            continue;
          }

          if (attr.name === "src" || attr.name === "srcset" || /\.(jpg|jpeg|png|webp)/i.test(attr.value)) {
            if (newImg.getAttribute(attr.name) === attr.value) {
              continue;
            }

            var attrName = attr.name;
            if (newImg.hasAttribute(attrName)) {
              attrName = "data-old-" + attrName;
            }

            newImg.setAttribute(attrName, attr.value);
          }
        }

        noscript.parentNode.replaceChild(tmp.firstElementChild, prevElement);
      }
    });
  },

  /**
   * Removes script tags from the document.
   *
   * @param Element
   **/
  _removeScripts: function (doc) {
    this._removeNodes(this._getAllNodesWithTag(doc, ["script", "noscript"]));
  },

  /**
   * Check if this node has only whitespace and a single element with given tag
   * Returns false if the DIV node contains non-empty text nodes
   * or if it contains no element with given tag or more than 1 element.
   *
   * @param Element
   * @param string tag of child element
   **/
  _hasSingleTagInsideElement: function (element, tag) {
    // There should be exactly 1 element child with given tag
    if (element.children.length != 1 || element.children[0].tagName !== tag) {
      return false;
    }

    // And there should be no text nodes with real content
    return !this._someNode(element.childNodes, function (node) {
      return node.nodeType === this.TEXT_NODE &&
        this.REGEXPS.hasContent.test(node.textContent);
    });
  },

  _isElementWithoutContent: function (node) {
    return node.nodeType === this.ELEMENT_NODE &&
      node.textContent.trim().length == 0 &&
      (node.children.length == 0 ||
        node.children.length == node.getElementsByTagName("br").length + node.getElementsByTagName("hr").length);
  },

  /**
   * Determine whether element has any children block level elements.
   *
   * @param Element
   */
  _hasChildBlockElement: function (element) {
    return this._someNode(element.childNodes, function (node) {
      return this.DIV_TO_P_ELEMS.has(node.tagName) ||
        this._hasChildBlockElement(node);
    });
  },

  /***
   * Determine if a node qualifies as phrasing content.
   * https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories#Phrasing_content
   **/
  _isPhrasingContent: function (node) {
    return node.nodeType === this.TEXT_NODE || this.PHRASING_ELEMS.indexOf(node.tagName) !== -1 ||
      ((node.tagName === "A" || node.tagName === "DEL" || node.tagName === "INS") &&
        this._everyNode(node.childNodes, this._isPhrasingContent)) ||
      // check if a link is followed by a text node
      // this means that a link is placed somewhere in the text
      (node.tagName === "A" && node.nextSibling && node.nextSibling.nodeType === 3) ||
      // font nodes shouldn't be independent elements
      (node.tagName === "FONT" && node.previousSibling && node.previousSibling.nodeType === 1);
  },

  _isWhitespace: function (node) {
    return (node.nodeType === this.TEXT_NODE && node.textContent.trim().length === 0) ||
      (node.nodeType === this.ELEMENT_NODE && node.tagName === "BR");
  },

  /**
   * Get the inner text of a node - cross browser compatibly.
   * This also strips out any excess whitespace to be found.
   *
   * @param Element
   * @param Boolean normalizeSpaces (default: true)
   * @return string
   **/
  _getInnerText: function (e, normalizeSpaces) {
    normalizeSpaces = (typeof normalizeSpaces === "undefined") ? true : normalizeSpaces;
    var textContent = e.textContent.trim();

    if (normalizeSpaces) {
      return textContent.replace(this.REGEXPS.normalize, " ");
    }
    return textContent;
  },

  /**
   * Get the number of times a string s appears in the node e.
   *
   * @param Element
   * @param string - what to split on. Default is ","
   * @return number (integer)
   **/
  _getCharCount: function (e, s) {
    s = s || ",";
    return this._getInnerText(e).split(s).length - 1;
  },

  /**
   * Remove the style attribute on every e and under.
   * TODO: Test if getElementsByTagName(*) is faster.
   *
   * @param Element
   * @return void
   **/
  _cleanStyles: function (e) {
    if (!e || e.tagName.toLowerCase() === "svg")
      return;

    // Remove `style` and deprecated presentational attributes
    for (var i = 0; i < this.PRESENTATIONAL_ATTRIBUTES.length; i++) {
      e.removeAttribute(this.PRESENTATIONAL_ATTRIBUTES[i]);
    }

    if (this.DEPRECATED_SIZE_ATTRIBUTE_ELEMS.indexOf(e.tagName) !== -1) {
      e.removeAttribute("width");
      e.removeAttribute("height");
    }

    var cur = e.firstElementChild;
    while (cur !== null) {
      this._cleanStyles(cur);
      cur = cur.nextElementSibling;
    }
  },

  _createInstagramPostPlaceholder: function (element, postId) {
    const post = this._doc.createElement('div');
    post.innerText = 'Instagram placeholder';
    post.className = 'instagram-placeholder';
    post.setAttribute('data-instagram-id', postId);
    element.parentNode.replaceChild(post, element);

    // remove all containers the IG post is nested in (if they contain the post only)
    let postParent = post.parentElement || post.parentNode;
    while (postParent && postParent.children.length === 1) {
      postParent.parentNode.replaceChild(post, postParent);
      postParent = post.parentElement || post.parentNode;
    }
  },

  _createPlaceholders: async function (e) {
    for (const element of Array.from(e.getElementsByTagName('a'))) {
      if (this.isEmbed(element)) {
        return;
      }

      // Create tweets placeholders from links
      if (element.href.includes('twitter.com') || (element.parentNode && element.parentNode.className === 'tweet')) {
        const link = element.href;
        const regex = /(https?:\/\/twitter\.com\/\w+\/status\/)(\d+)/gm;
        const match = regex.exec(link);

        if (Array.isArray(match) && typeof match[2] === 'string' && parentClassIncludes(element, 'tweet')) {
          const tweet = this._doc.createElement('div');
          tweet.innerText = 'Tweet placeholder';
          tweet.className = 'tweet-placeholder';
          tweet.setAttribute('data-tweet-id', match[2]);
          element.parentNode.replaceChildren(tweet);

          // remove all containers the tweet is nested in (if they contain the tweet only)
          let tweetParent = tweet.parentElement || tweet.parentNode;
          while (tweetParent && tweetParent.children.length === 1 && tweetParent.parentNode) {
            tweetParent.parentNode.replaceChild(tweet, tweetParent);
            tweetParent = tweet.parentElement || tweet.parentNode;
          }

          if (tweetParent && tweetParent.className.includes('twitter-tweet') && tweetParent.parentNode) {
            tweetParent.parentNode.replaceChild(tweet, tweetParent);
          }
        } else if (element.parentNode && element.parentNode.className === 'tweet') {
          // Create tweets placeholders from classname
          try {
            const response = await axios.get(link);
            const tweetUrl = response.request.res.responseUrl;
            const match = regex.exec(tweetUrl);
            if (Array.isArray(match) && typeof match[2] === 'string') {
              const tweet = this._doc.createElement('div');
              tweet.innerText = 'Tweet placeholder';
              tweet.className = 'tweet-placeholder';
              tweet.setAttribute('data-tweet-id', match[2]);
              element.parentNode.replaceWith(tweet);
            }
          } catch (e) {
            this.log('Error loading tweet: ', link, e);
          }
        }
      }

      // Create instagram posts placeholders from links
      if (element.href.includes('instagram.com/p')) {
        const link = element.href;
        const regex = /https?:\/\/(www\.)?instagram.com\/p\/(\w+)\//gm;
        const match = regex.exec(link);

        if (Array.isArray(match) && typeof match[2] === 'string' && parentClassIncludes(element, 'instagram')) {
          this._createInstagramPostPlaceholder(element, match[2]);
        }
      }
    }

    Array.from(e.getElementsByTagName('iframe')).forEach(element => {

      // Create tweets placeholders from iframes
      if (element.getAttribute('data-tweet-id')) {
        const tweet = this._doc.createElement('div');
        tweet.innerText = 'Tweet placeholder';
        tweet.className = 'tweet-placeholder';
        tweet.setAttribute('data-tweet-id', element.getAttribute('data-tweet-id'));
        element.parentNode.replaceChild(tweet, element);

        // remove all containers the tweet is nested in (if they contain the tweet only)
        let tweetParent = tweet.parentElement || tweet.parentNode;
        while (tweetParent && tweetParent.children.length === 1) {
          tweetParent.parentNode.replaceChild(tweet, tweetParent);
          tweetParent = tweet.parentElement || tweet.parentNode;
        }
      }

      // Create instagram posts placeholders from iframes
      if (element.getAttribute('src')?.includes('instagram.com/p')) {
        const url = element.getAttribute('src');
        const regex = /https?:\/\/(www\.)?instagram.com\/p\/(\w+)\//gm;
        const match = regex.exec(url);

        if (Array.isArray(match) && typeof match[2] === 'string') {
          this._createInstagramPostPlaceholder(element, match[2]);
        }
      }
    });
  },

  // Check whether an element is a child of an embed
  isEmbed: function (element) {
    while (element.parentNode && element.parentNode.tagName !== 'BODY') {
      if (this.EMBEDS_CLASSES.includes(element.className)) {
        return true;
      }
      element = element.parentNode;
    }
    return false
  },

  hasEmbed: function(element) {
    if (element.querySelector === undefined) {
      return false;
    }

    const classes = this.EMBEDS_CLASSES.reduce((res, cur, i) => `${i > 0 && (res + ',')}.${cur}`, '');

    const candidates = element.querySelector(classes);
    return !!candidates;
  },


  /**
   * Get the density of links as a percentage of the content
   * This is the amount of text that is inside a link divided by the total text in the node.
   *
   * @param Element
   * @return number (float)
   **/
  _getLinkDensity: function(element) {
    // If we are ignoring link density (often we do this for newsletters, just set it to zero so all link density checks pass)
    if (this._ignoreLinkDensity) {
      return 0
    }
    var textLength = this._getInnerText(element).length;
    if (textLength === 0)
      return 0;

    var linkLength = 0;

    // XXX implement _reduceNodeList?
    this._forEachNode(element.getElementsByTagName("a"), function(linkNode) {
      var href = linkNode.getAttribute("href");
      var coefficient = href && this.REGEXPS.hashUrl.test(href) ? 0.3 : 1;
      // Disabling link density counting for inside the figure caption, because they are mostly the links
      // for the author of the photo.
      // Article fix example: https://medium.com/@Kasturi/two-things-can-make-you-money-without-a-9-5-job-9bdf6da8b09c
      //  - First large photo with a 2 links inside of the caption
      linkNode.parentNode.tagName !== "FIGCAPTION" && (linkLength += this._getInnerText(linkNode).length * coefficient);
    });

    return linkLength / textLength;
  },

  /**
   * Get an elements class/id weight. Uses regular expressions to tell if this
   * element looks good or bad.
   *
   * @param Element
   * @return number (Integer)
   **/
  _getClassWeight: function(e) {
    if (!this._flagIsActive(this.FLAG_WEIGHT_CLASSES))
      return 0;

    var weight = 0;

    // Look for a special classname
    if (typeof(e.className) === "string" && e.className !== "") {
      if (this.REGEXPS.negative.test(e.className))
        weight -= 25;

      if (this.REGEXPS.positive.test(e.className))
        weight += 25;
    }

    // Look for a special ID
    if (typeof(e.id) === "string" && e.id !== "") {
      if (this.REGEXPS.negative.test(e.id))
        weight -= 25;

      if (this.REGEXPS.positive.test(e.id))
        weight += 25;
    }

    return weight;
  },

  /**
   * Clean a node of all elements of type "tag".
   * (Unless it's a youtube/vimeo video. People love movies.)
   *
   * @param Element
   * @param string tag to clean
   * @return void
   **/
  _clean: function(e, tag) {
    var isEmbed = ["object", "embed", "iframe"].indexOf(tag) !== -1;

    this._removeNodes(this._getAllNodesWithTag(e, [tag]), function(element) {
      // Allow youtube and vimeo videos through as people usually want to see those.
      if (isEmbed) {
        // First, check the elements attributes to see if any of them contain youtube or vimeo
        for (var i = 0; i < element.attributes.length; i++) {
          if (this.REGEXPS.videos.test(element.attributes[i].value)) {
            return false;
          }
        }

        // For embed with <object> tag, check inner HTML as well.
        if (element.tagName === "object" && this.REGEXPS.videos.test(element.innerHTML)) {
          return false;
        }
      }

      // Disabling aside elements removing if it contains only the BLOCKQUOTE element and taking it out of the aside node
      // Related to the article - https://www.atlasobscura.com/articles/grapefruit-history-and-drug-interactions
      // Content example: "Citrus hybridizes so easily that there are undoubtedly thousands"...
      if (element.children.length === 1 && element.children[0].tagName === "BLOCKQUOTE") {
        element.parentNode.replaceChild(element.children[0], element);
        return false;
      }

      return true;
    });
  },

  /**
   * Check if a given node has one of its ancestor tag name matching the
   * provided one.
   * @param  HTMLElement node
   * @param  String      tagName
   * @param  Number      maxDepth
   * @param  Function    filterFn a filter to invoke to determine whether this node 'counts'
   * @return Boolean
   */
  _hasAncestorTag: function(node, tagName, maxDepth, filterFn) {
    maxDepth = maxDepth || 3;
    tagName = tagName.toUpperCase();
    var depth = 0;
    while (node.parentNode) {
      if (maxDepth > 0 && depth > maxDepth)
        return false;
      if (node.parentNode.tagName === tagName && (!filterFn || filterFn(node.parentNode)))
        return true;
      node = node.parentNode;
      depth++;
    }
    return false;
  },

  /**
   * Return an object indicating how many rows and columns this table has.
   */
  _getRowAndColumnCount: function(table) {
    var rows = 0;
    var columns = 0;
    var trs = table.getElementsByTagName("tr");
    for (var i = 0; i < trs.length; i++) {
      var rowspan = trs[i].getAttribute("rowspan") || 0;
      if (rowspan) {
        rowspan = parseInt(rowspan, 10);
      }
      rows += (rowspan || 1);

      // Now look for column-related info
      var columnsInThisRow = 0;
      var cells = trs[i].getElementsByTagName("td");
      for (var j = 0; j < cells.length; j++) {
        var colspan = cells[j].getAttribute("colspan") || 0;
        if (colspan) {
          colspan = parseInt(colspan, 10);
        }
        columnsInThisRow += (colspan || 1);
      }
      columns = Math.max(columns, columnsInThisRow);
    }
    return {rows: rows, columns: columns};
  },

  /**
   * Look for 'data' (as opposed to 'layout') tables, for which we use
   * similar checks as
   * https://dxr.mozilla.org/mozilla-central/rev/71224049c0b52ab190564d3ea0eab089a159a4cf/accessible/html/HTMLTableAccessible.cpp#920
   */
  _markDataTables: function(root) {
    var tables = root.getElementsByTagName("table");
    for (var i = 0; i < tables.length; i++) {
      var table = tables[i];
      var role = table.getAttribute("role");
      if (role == "presentation") {
        table._readabilityDataTable = false;
        continue;
      }
      var datatable = table.getAttribute("datatable");
      if (datatable == "0") {
        table._readabilityDataTable = false;
        continue;
      }
      var summary = table.getAttribute("summary");
      if (summary) {
        table._readabilityDataTable = true;
        continue;
      }

      var caption = table.getElementsByTagName("caption")[0];
      if (caption && caption.childNodes.length > 0) {
        table._readabilityDataTable = true;
        continue;
      }

      // If the table has a descendant with any of these tags, consider a data table:
      var dataTableDescendants = ["col", "colgroup", "tfoot", "thead", "th"];
      var descendantExists = function(tag) {
        return !!table.getElementsByTagName(tag)[0];
      };
      if (dataTableDescendants.some(descendantExists)) {
        this.log("Data table because found data-y descendant");
        table._readabilityDataTable = true;
        continue;
      }

      // Nested tables indicate a layout table:
      if (table.getElementsByTagName("table")[0]) {
        table._readabilityDataTable = false;
        continue;
      }

      var sizeInfo = this._getRowAndColumnCount(table);
      if (sizeInfo.rows >= 10 || sizeInfo.columns > 4) {
        table._readabilityDataTable = true;
        continue;
      }
      // Now just go by size entirely:
      table._readabilityDataTable = sizeInfo.rows * sizeInfo.columns > 10;
    }
  },

  /* convert images and figures that have properties like data-src into images that can be loaded without JS */
  _fixLazyImages: function (root) {
    this._forEachNode(this._getAllNodesWithTag(root, ["img", "picture", "figure", "svg"]), function (elem) {
      // Checking and removing small sqaure images, in most cases redundant small author photo or svg buttons
      var imgHeight = parseInt(elem.getAttribute("height") || 0);
      var imgWidhth = parseInt(elem.getAttribute("width") || 0);
      if (imgHeight && imgWidhth && imgHeight === imgWidhth) {
        if (elem.tagName.toLowerCase() === 'svg') {
          if(imgHeight <= 21){
            this.log(`Removing small square SVG: ${imgWidhth}x${imgHeight}`, `className: ${elem.className}`, `src: ${elem.src}`);
            elem.parentNode.removeChild(elem);
          }
          return;
        } else if(imgHeight <= 80) {
          this.log(`Removing small square image: ${imgWidhth}x${imgHeight}`, `className: ${elem.className}`, `src: ${elem.src}`);
          elem.parentNode.removeChild(elem);
          return;
        }
      }

      // Setting element "data-src" attribute value to the src if not specified.
      // Article example: https://nymag.com/intelligencer/2020/12/four-seasons-total-landscaping-the-full-est-possible-story.html
      if (!elem.getAttribute('src') && elem.dataset && elem.dataset.src) {
        elem.setAttribute('src', elem.dataset.src)
      }

      if (elem.getAttribute('data-lazy-src')) {
        elem.setAttribute('src', elem.getAttribute('data-lazy-src'))
      }

      // In some sites (e.g. Kotaku), they put 1px square image as base64 data uri in the src attribute.
      // So, here we check if the data uri is too short, just might as well remove it.
      if (elem.src && this.REGEXPS.b64DataUrl.test(elem.src)) {
        // Make sure it's not SVG, because SVG can have a meaningful image in under 133 bytes.
        var parts = this.REGEXPS.b64DataUrl.exec(elem.src);
        if (parts[1] === "image/svg+xml") {
          return;
        }

        // Make sure this element has other attributes which contains image.
        // If it doesn't, then this src is important and shouldn't be removed.
        var srcCouldBeRemoved = false;
        for (var i = 0; i < elem.attributes.length; i++) {
          var attr = elem.attributes[i];
          if (attr.name === "src") {
            continue;
          }

          if (/\.(jpg|jpeg|png|webp)/i.test(attr.value)) {
            srcCouldBeRemoved = true;
            break;
          }
        }

        // Here we assume if image is less than 100 bytes (or 133B after encoded to base64)
        // it will be too small, therefore it might be placeholder image.
        if (srcCouldBeRemoved) {
          var b64starts = elem.src.search(/base64\s*/i) + 7;
          var b64length = elem.src.length - b64starts;
          if (b64length < 133) {
            elem.removeAttribute("src");
          }
        }
      }

      // also check for "null" to work around https://github.com/jsdom/jsdom/issues/2580
      if ((elem.src || (elem.srcset && elem.srcset != "null")) && elem.className.toLowerCase().indexOf("lazy") === -1) {
        // Removing image that is redundant loading placeholder
        // Example article: https://www.instyle.com/celebrity/gigi-hadid/gigi-hadid-bangs-2020 (image className: "loadingPlaceholder")
        if (elem.className && this.REGEXPS.lazyLoadingElements.test(elem.className)) {
          elem.parentNode.removeChild(elem);
        }
        return;
      }

      for (var j = 0; j < elem.attributes.length; j++) {
        attr = elem.attributes[j];
        if (attr.name === "src" || attr.name === "srcset") {
          continue;
        }
        var copyTo = null;
        if (/\.(jpg|jpeg|png|webp)\s+\d/.test(attr.value)) {
          copyTo = "srcset";
        } else if (/^\s*\S+\.(jpg|jpeg|png|webp)\S*\s*$/.test(attr.value)) {
          copyTo = "src";
        }
        if (copyTo) {
          //if this is an img or picture, set the attribute directly
          if (elem.tagName === "IMG" || elem.tagName === "PICTURE") {
            elem.setAttribute(copyTo, attr.value);
          } else if (elem.tagName === "FIGURE" && !this._getAllNodesWithTag(elem, ["img", "picture"]).length) {
            //if the item is a <figure> that does not contain an image or picture, create one and place it inside the figure
            //see the nytimes-3 testcase for an example
            var img = this._doc.createElement("img");
            img.setAttribute(copyTo, attr.value);
            elem.appendChild(img);
          }
        }
      }
    });
  },

  _getTextDensity: function(e, tags) {
    var textLength = this._getInnerText(e, true).length;
    if (textLength === 0) {
      return 0;
    }
    var childrenLength = 0;
    var children = this._getAllNodesWithTag(e, tags);
    this._forEachNode(children, (child) => childrenLength += this._getInnerText(child, true).length);
    return childrenLength / textLength;
  },

  /**
   * Clean an element of all tags of type "tag" if they look fishy.
   * "Fishy" is an algorithm based on content length, classnames, link density, number of images & embeds, etc.
   *
   * @return void
   **/
  _cleanConditionally: function(e, tag) {
    if (!this._flagIsActive(this.FLAG_CLEAN_CONDITIONALLY))
      return;

    // Traverse backwards so we can remove nodes at the same time
    // without effecting the traversal.
    //
    // TODO: Consider taking into account original contentScore here.
    this._removeNodes(this._getAllNodesWithTag(e, [tag]), function(node) {
      // First check if this node IS data table, in which case don't remove it.
      var isDataTable = function(t) {
        return t._readabilityDataTable;
      };

      // Do not clean placeholders
      if (this.PLACEHOLDER_CLASSES.includes(node.className)) {
        return false;
      }

      var isList = tag === "ul" || tag === "ol";

      // If a list is related to navigation, it should be removed
      if (isList && this._isProbablyNavigation(node)) {
        return true;
      }

      if (!isList) {
        var listLength = 0;
        var listNodes = this._getAllNodesWithTag(node, ["ul", "ol"]);
        this._forEachNode(listNodes, (list) => listLength += this._getInnerText(list).length);
        isList = listLength / this._getInnerText(node).length > 0.9;
      }

      if (tag === "table" && isDataTable(node)) {
        return false;
      }

      // Next check if we're inside a data table, in which case don't remove it as well.
      if (this._hasAncestorTag(node, "table", -1, isDataTable)) {
        return false;
      }

      if (this._hasAncestorTag(node, "code")) {
        return false;
      }

      // Avoiding lazyloaded images container removing
      // TODO: Rework this logic to work in a more robust and flexible way, this solution is fragile
      // Article example: https://nymag.com/intelligencer/2020/12/four-seasons-total-landscaping-the-full-est-possible-story.html
      if (node.children.length === 1 && node.children[0].tagName.toLowerCase() === 'picture') {
        return false;
      }

      var weight = this._getClassWeight(node);

      var contentScore = 0;

      if (weight + contentScore < 0) {
        this.log("Cleaning Conditionally by weight", { text: node.innerText, className: node.className, children: Array.from(node.children).map(ch => ch.tagName)});
        return true;
      }

      if (this._getCharCount(node, ",") < 10) {
        // If there are not very many commas, and the number of
        // non-paragraph elements is more than paragraphs or other
        // ominous signs, remove the element.
        var p = node.getElementsByTagName("p").length;
        var img = node.getElementsByTagName("img").length;
        var li = node.getElementsByTagName("li").length - 100;
        var input = node.getElementsByTagName("input").length;
        var headingDensity = this._getTextDensity(node, ["h1", "h2", "h3", "h4", "h5", "h6"]);

        var embedCount = 0;
        var embeds = this._getAllNodesWithTag(node, ["object", "embed", "iframe"]);

        for (var i = 0; i < embeds.length; i++) {
          // If this embed has attribute that matches video regex, don't delete it.
          for (var j = 0; j < embeds[i].attributes.length; j++) {
            if (this.REGEXPS.videos.test(embeds[i].attributes[j].value)) {
              return false;
            }
          }

          // For embed with <object> tag, check inner HTML as well.
          if (embeds[i].tagName === "object" && this.REGEXPS.videos.test(embeds[i].innerHTML)) {
            return false;
          }

          embedCount++;
        }

        var innerText = this._getInnerText(node)
        var linkDensity = this._getLinkDensity(node);
        var contentLength = innerText.length;

        const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/gu;
        const textHasEmoji = Array.from(innerText.matchAll(emojiRegex)).length > 0

        if (hasTweetInChildren(node)) {
          return false;
        }

        if (this.isEmbed(node) || this.hasEmbed(node)) {
          return false;
        }

        var parentClasses = node.parentNode?.classList || [];
        var haveToRemove =
          !this._isOmnivoreNode(node) && (
          (img > 1 && p / img < 0.5 && !this._hasAncestorTag(node, "figure")) ||
          (!isList && li > p) ||
          (input > Math.floor(p/3)) ||
          (!isList && headingDensity < 0.9 && contentLength < 25 && !textHasEmoji && (img === 0 || img > 2) && !this._hasAncestorTag(node, "figure")) ||
          // ignores link density for the links inside the .post-body div (the main content)
          (!isList && weight < 25 && linkDensity > 0.2 && !(this.CLASSES_TO_SKIP.some((c) => parentClasses.contains(c))) )||
          // some website like https://substack.com might have their custom styling of tweets
          // we should omit ignoring their particular case by checking against "tweet" classname
          (weight >= 25 && linkDensity > 0.5 && !(node.className === "tweet" && linkDensity === 1)) ||
          ((embedCount === 1 && contentLength < 75) || embedCount > 1))

        // Allow simple lists of images to remain in pages
        if (isList && haveToRemove) {
          for (var x = 0; x < node.children.length; x++) {
            let child = node.children[x];
            // Don't filter in lists with li's that contain more than one child
            if (child.children.length > 1) {
              return haveToRemove;
            }
          }
          var li_count = node.getElementsByTagName("li").length;
          // Only allow the list to remain if every li contains an image
          if (img === li_count) {
            return false;
          }
        }

        if (haveToRemove) {
          this.log("Cleaning Conditionally", { className: node.className, children: Array.from(node.children).map(ch => ch.tagName) });
        }

        return haveToRemove;
      }
      return false;
    });
  },

  _isOmnivoreNode: function(node) {
    const prefix = '_omnivore'
    var walk = node

    while (walk) {
      if (walk.className && walk.className.startsWith && walk.className.startsWith(prefix)) {
        return true
      }
      if (walk.className && walk.className.hasOwnProperty && walk.className.hasOwnProperty(prefix)) {
        return true
      }
      walk = walk.parentElement
    }
    return false
  },

  /**
   * Clean out elements that match the specified conditions
   *
   * @param Element
   * @param Function determines whether a node should be removed
   * @return void
   **/
  _cleanMatchedNodes: function(e, filter) {
    var endOfSearchMarkerNode = this._getNextNode(e, true);
    var next = this._getNextNode(e);
    while (next && next != endOfSearchMarkerNode) {
      if (filter.call(this, next, next.className + " " + next.id)) {
        next = this._removeAndGetNext(next);
      } else {
        next = this._getNextNode(next);
      }
    }
  },

  /**
   * Clean out spurious headers from an Element.
   *
   * @param Element
   * @return void
   **/
  _cleanHeaders: function (e) {
    const WEIGHT_MEANING_HEADERS = ['h1', 'h2']
    let headingNodes = this._getAllNodesWithTag(e, ["h1", "h2", "h3"]);
    let nodeToRemove = this._findNode(headingNodes, (node) => {
      let heading = this._getInnerText(node, false);
      return this._textSimilarity(this._articleTitle, heading) > 0.75 ||
        WEIGHT_MEANING_HEADERS.includes(node.tagName.toLowerCase()) && this._getClassWeight(node) < 0;
    });
    if (nodeToRemove) {
      this._removeNodes([nodeToRemove]);
    }
  },

  /**
   * Check if this node is an H1 or H2 element whose content is mostly
   * the same as the article title.
   *
   * @param Element  the node to check.
   * @return boolean indicating whether this is a title-like header.
   */
  _headerDuplicatesTitle: function(node) {
    if (node.tagName !== "H1" && node.tagName !== "H2") {
      return false;
    }
    var heading = this._getInnerText(node, false);
    return this._textSimilarity(this._articleTitle, heading) > 0.75;
  },

  _flagIsActive: function(flag) {
    return (this._flags & flag) > 0;
  },

  _removeFlag: function(flag) {
    this._flags = this._flags & ~flag;
  },

  _isProbablyVisible: function(node) {
    // Have to null-check node.style and node.className.indexOf to deal with SVG and MathML nodes.
    return (!node.style || node.style.display !== "none")
      && (node.style && node.style.visibility !== 'hidden')
      && !node.hasAttribute("hidden")
      //check for "fallback-image" so that wikimedia math images are displayed
      && (!node.hasAttribute("aria-hidden")
        || !(node.getAttribute("aria-hidden") === "true" && node.parentElement.tagName.toLowerCase() !== 'figcaption')
        || (node.className && node.className.indexOf && node.className.indexOf("fallback-image") !== -1));
  },

  _isProbablyNavigation: function(node) {
    const navRelatedClasses = /next|prev|previous/g;

    if (node.tagName !== 'OL' && node.tagName !== 'UL') {
      return false;
    }

    const children = Array.from(node.getElementsByTagName('li'));
    for (const child of children) {
      if (navRelatedClasses.test(child.className) && node.getElementsByTagName('a') !== null) {
        return true;
      }
    }

    return false;
  },

  _getLanguage: async function(content, locale, languageCode) {
    try {
      let code = locale || languageCode.replace('_', '-') || 'en';

      // detect language from the html content
      const languages = (await cld.detect(content, { isHTML: true })).languages;
      this.log('Detected languages: ', languages);
      if (languages.length > 0) {
        code = languages[0].code;
      }

      this.log('Getting language name from code: ', code);
      let lang = new Intl.DisplayNames(['en'], {type: 'language'});
      return lang.of(code);
    } catch (error) {
      this.log('Failed to get language', error);
      return 'English';
    }
  },

  /**
   * Runs readability.
   *
   * Workflow:
   *  1. Prep the document by removing script tags, css, etc.
   *  2. Build readability's DOM tree.
   *  3. Grab the article content from the current dom tree.
   *  4. Replace the current DOM tree with the new one.
   *  5. Read peacefully.
   *
   **/
  parse: async function() {
    // Avoid parsing too large documents, as per configuration option
    if (this._maxElemsToParse > 0) {
      var numTags = this._doc.getElementsByTagName("*").length;
      if (numTags > this._maxElemsToParse) {
        throw new Error("Aborting parsing document; " + numTags + " elements found");
      }
    }

    // Unwrap image from noscript
    this._unwrapNoscriptImages(this._doc);

    // Extract JSON-LD metadata before removing scripts
    var jsonLd = this._disableJSONLD ? {} : this._getJSONLD(this._doc);

    this._languageCode = this._doc.documentElement.lang

    // Remove script tags from the document.
    this._removeScripts(this._doc);

    this._prepDocument();

    var metadata = this._getArticleMetadata(jsonLd);
    this._articleTitle = metadata.title;

    var articleContent = await this._grabArticle();
    if (!articleContent)
      return null;

    const byline = metadata.byline || this._articleByline;
    const [author, publishedDateFromAuthor] = extractPublishedDateFromAuthor(byline);
    const publishedDate = metadata.publishedDate || 
      extractPublishedDateFromUrl(this._documentURI) || 
      publishedDateFromAuthor || 
      this._articlePublishedDate;

    this._postProcessContent(articleContent);

    // If we haven't found an excerpt in the article's metadata, use the article's
    // first meaningful paragraph (more than 50 characters) as the excerpt. This is used for displaying a preview of
    // the article's content.
    if (!metadata.excerpt) {
      var paragraphs = articleContent.getElementsByTagName("p");
      for (const p of paragraphs) {
        const text = p.textContent.trim();

        if (text.length > 50) {
          metadata.excerpt = text;
          break;
        }
      };
    }
    if (!metadata.siteName) {
      // Fallback to hostname
      try {
        const host = new URL(this._baseURI).hostname;
        metadata.siteName = host.replace(/^www\./, "");
      } catch (e) {
        // Ignore
      }
    }

    var textContent = articleContent.textContent;
    const content = this._serializer(articleContent);
    const language = await this._getLanguage(content, metadata.locale, this._languageCode);
    return {
      title: this._articleTitle,
      // remove \n and extra spaces and trim the string
      byline: author ? author.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim() : null,
      dir: this._articleDir,
      content,
      textContent: textContent,
      length: textContent.length,
      excerpt: metadata.excerpt,
      siteName: metadata.siteName,
      siteIcon: metadata.siteIcon,
      previewImage: metadata.previewImage,
      publishedDate,
      language,
      documentElement: articleContent,
    };
  }
};

if (typeof module === "object") {
  module.exports = Readability;
}
