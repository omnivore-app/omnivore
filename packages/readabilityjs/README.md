# Readability.js

A standalone version of the readability library used for Firefox Reader View.

## Usage on the web

To parse a document, you must create a new `Readability` object from a DOM document object, and then call `parse()`. Here's an example:

```javascript
var article = new Readability(document).parse();
```

This `article` object will contain the following properties:

* `title`: article title
* `content`: HTML string of processed article content
* `textContent`: text content of the article (all HTML removed)
* `length`: length of an article, in characters
* `excerpt`: article description, or short excerpt from the content
* `byline`: author metadata
* `dir`: content direction

If you're using Readability on the web, you will likely be able to use a `document` reference
from elsewhere (e.g. fetched via XMLHttpRequest, in a same-origin `<iframe>` you have access to, etc.).

### Optional

Readability's `parse()` works by modifying the DOM. This removes some elements in the web page.
You could avoid this by passing the clone of the `document` object while creating a `Readability` object.

```
var documentClone = document.cloneNode(true); 
var article = new Readability(documentClone).parse();
```

## Usage from Node.js

Readability is available on npm:

```bash
npm install @omnivore/readability
```

In Node.js, you won't generally have a DOM document object. To obtain one, you can use external
libraries like [jsdom](https://github.com/jsdom/jsdom). While this repository contains a parser of
its own (`JSDOMParser`), that is restricted to reading XML-compatible markup and therefore we do
not recommend it for general use.

If you're using `jsdom` to create a DOM object, you should ensure that the page doesn't run (page)
scripts (avoid fetching remote resources etc.) as well as passing it the page's URI as the `url`
property of the `options` object you pass the `JSDOM` constructor.

### Example:

```js
var { Readability } = require('@omnivore/readability');
var JSDOM = require('jsdom').JSDOM;
var doc = new JSDOM("<body>Here's a bunch of text</body>", {
  url: "https://www.example.com/the-page-i-got-the-source-from"
});
let reader = new Readability(doc.window.document);
let article = reader.parse();
```

## What's Readability-readerable?

It's a quick-and-dirty way of figuring out if it's plausible that the contents of a given
document are suitable for processing with Readability. It is likely to produce both false
positives and false negatives. The reason it exists is to avoid bogging down a time-sensitive
process (like loading and showing the user a webpage) with the complex logic in the core of
Readability. Improvements to its logic (while not deteriorating its performance) are very
welcome.

## Security

If you're going to use Readability with untrusted input (whether in HTML or DOM form), we
**strongly** recommend you use a sanitizer library like
[DOMPurify](https://github.com/cure53/DOMPurify) to avoid script injection when you use
the output of Readability. We would also recommend using
[CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) to add further defense-in-depth
restrictions to what you allow the resulting content to do. The Firefox integration of
reader mode uses both of these techniques itself. Sanitizing unsafe content out of the input
is explicitly not something we aim to do as part of Readability itself - there are other
good sanitizer libraries out there, use them!

## Contributing

[![Build Status](https://community-tc.services.mozilla.com/api/github/v1/repository/mozilla/readability/master/badge.svg)](https://community-tc.services.mozilla.com/api/github/v1/repository/mozilla/readability/master/latest)

For outstanding issues, see the issue list in this repo, as well as this [bug list](https://bugzilla.mozilla.org/buglist.cgi?component=Reader%20Mode&product=Toolkit&bug_status=__open__&limit=0).

Any changes to Readability.js itself should be reviewed by an [appropriate Firefox/toolkit peer](https://wiki.mozilla.org/Modules/Firefox), such as [@gijsk](https://github.com/gijsk), since these changes will be merged to mozilla-central and shipped in Firefox.

To test local changes to Readability.js, you can use the [automated tests](#tests). There's a [node script](https://github.com/mozilla/readability/blob/master/test/generate-testcase.js) to help you create new ones.

## Tests

Please run [eslint](http://eslint.org/) as a first check that your changes are valid JS and adhere to our style guidelines.

To run the test suite:

    $ mocha test/test-*.js

To run a specific test page by its name:

    $ mocha test/test-*.js -g 001

To run the test suite in TDD mode:

    $ mocha test/test-*.js -w

Combo time:

    $ mocha test/test-*.js -w -g 001

## Benchmarks

Benchmarks for all test pages:

    $ npm run perf

Reference benchmark:

    $ npm run perf-reference

## License

    Copyright (c) 2010 Arc90 Inc

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
