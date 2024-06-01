var debug = false

var path = require('path')
var fs = require('fs')
var prettyPrint = require('./utils').prettyPrint
var htmltidy = require('htmltidy2').tidy

var { Readability, isProbablyReaderable } = require('../index')
const { parseHTML } = require('linkedom')

const puppeteer = require('puppeteer-extra')

// Add stealth plugin to hide puppeteer usage
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

// Add adblocker plugin to block all ads and trackers (saves bandwidth)
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
puppeteer.use(AdblockerPlugin({ blockTrackers: true }))

var testcaseRoot = path.join(__dirname, 'test-pages')

var argURL = process.argv[3] // Could be undefined, we'll warn if it is if that is an issue.

const DESKTOP_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_6_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4372.0 Safari/537.36'
const NON_BOT_DESKTOP_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
const NON_BOT_HOSTS = ['bloomberg.com', 'forbes.com']
const NON_SCRIPT_HOSTS = ['medium.com', 'fastcompany.com']

const userAgentForUrl = (url) => {
  try {
    const u = new URL(url)
    for (const host of NON_BOT_HOSTS) {
      if (u.hostname.endsWith(host)) {
        return NON_BOT_DESKTOP_USER_AGENT
      }
    }
  } catch (e) {
    console.log('error getting user agent for url', url, e)
  }
  return DESKTOP_USER_AGENT
}

const enableJavascriptForUrl = (url) => {
  try {
    const u = new URL(url)
    for (const host of NON_SCRIPT_HOSTS) {
      if (u.hostname.endsWith(host)) {
        return false
      }
    }
  } catch (e) {
    console.log('error getting hostname for url', url, e)
  }
  return true
}

function generateTestcase(slug) {
  const options = {
    debug,
  }
  if (slug.startsWith('newsletters/')) {
    // keep the newsletter content in tables
    options.keepTables = true
    options.ignoreLinkDensity = true
  }
  var destRoot = path.join(testcaseRoot, slug)

  fs.mkdir(destRoot, function (err) {
    if (err) {
      var sourceFile = path.join(destRoot, 'source.html')
      fs.exists(sourceFile, function (exists) {
        if (exists) {
          fs.readFile(
            sourceFile,
            { encoding: 'utf-8' },
            function (readFileErr, data) {
              if (readFileErr) {
                console.error("Source existed but couldn't be read?")
                process.exit(1)
              }
              onResponseReceived(null, data, destRoot, options)
            }
          )
        } else {
          fs.writeFile(path.join(destRoot, 'url.txt'), argURL, () => null)
          fetchSource(argURL, function (fetchErr, data) {
            onResponseReceived(fetchErr, data, destRoot, options)
          })
        }
      })
      return
    }
    fs.writeFile(path.join(destRoot, 'url.txt'), argURL, () => null)
    fetchSource(argURL, function (fetchErr, data) {
      onResponseReceived(fetchErr, data, destRoot, options)
    })
  })
}

async function fetchSource(url, callbackFn) {
  if (!url) {
    console.error("You should pass a URL if the source doesn't exist yet!")
    process.exit(1)
  }

  const browser = await puppeteer.launch({
    args: [
      '--allow-running-insecure-content',
      '--autoplay-policy=user-gesture-required',
      '--disable-component-update',
      '--disable-domain-reliability',
      '--disable-features=AudioServiceOutOfProcess,IsolateOrigins,site-per-process',
      '--disable-print-preview',
      '--disable-setuid-sandbox',
      '--disable-site-isolation-trials',
      '--disable-speech-api',
      '--disable-web-security',
      '--disk-cache-size=33554432',
      '--enable-features=SharedArrayBuffer',
      '--hide-scrollbars',
      '--disable-gpu',
      '--mute-audio',
      '--no-default-browser-check',
      '--no-pings',
      '--no-sandbox',
      '--no-zygote',
      '--window-size=1920,1080',
      '--disable-extensions',
    ],
    defaultViewport: {
      deviceScaleFactor: 1,
      hasTouch: false,
      height: 1080,
      isLandscape: true,
      isMobile: false,
      width: 1920,
    },
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || '/opt/homebrew/bin/chromium',
  })

  const page = await browser.newPage()
  if (!enableJavascriptForUrl(url)) {
    await page.setJavaScriptEnabled(false)
  }
  await page.setUserAgent(userAgentForUrl(url))

  try {
    /*
     * Disallow MathJax from running in Puppeteer and modifying the document,
     * we shall instead run it in our frontend application to transform any
     * mathjax content when present.
     */
    await page.setRequestInterception(true)
    page.on('request', (request) => {
      if (
        request.resourceType() === 'script' &&
        request.url().toLowerCase().indexOf('mathjax') > -1
      ) {
        request.abort()
      } else {
        request.continue()
      }
    })

    await page.goto(url, { waitUntil: ['networkidle2'] })

    /* scroll with a 5 second timeout */
    await Promise.race([
      new Promise((resolve) => {
        ;(async function () {
          try {
            await page.evaluate(`(async () => {
              /* credit: https://github.com/puppeteer/puppeteer/issues/305 */
              return new Promise((resolve, reject) => {
                let scrollHeight = document.body.scrollHeight;
                let totalHeight = 0;
                let distance = 500;
                let timer = setInterval(() => {
                  window.scrollBy(0, distance);
                  totalHeight += distance;
                  if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve(true);
                  }
                }, 10);
              });
            })()`)
          } catch (e) {
            console.error('error in scrolling url', { e, url })
          } finally {
            resolve(true)
          }
        })()
      }),
      new Promise((resolve) => setTimeout(resolve, 5000)),
    ])

    // get document body with all hidden elements removed
    const domContent = await page.evaluate(() => {
      const BI_SRC_REGEXP = /url\("(.+?)"\)/gi

      Array.from(document.body.getElementsByTagName('*')).forEach((el) => {
        const style = window.getComputedStyle(el)

        try {
          // Removing blurred images since they are mostly the copies of lazy loaded ones
          if (
            el.tagName &&
            ['img', 'image'].includes(el.tagName.toLowerCase())
          ) {
            const filter = style.getPropertyValue('filter')
            if (filter && filter.startsWith('blur')) {
              el.parentNode && el.parentNode.removeChild(el)
            }
          }
        } catch (err) {
          // throw Error('error with element: ' + JSON.stringify(Array.from(document.body.getElementsByTagName('*'))))
        }

        // convert all nodes with background image to img nodes
        if (
          !['', 'none'].includes(style.getPropertyValue('background-image'))
        ) {
          const filter = style.getPropertyValue('filter')
          // avoiding image nodes with a blur effect creation
          if (filter && filter.startsWith('blur')) {
            el && el.parentNode && el.parentNode.removeChild(el)
          } else {
            const matchedSRC = BI_SRC_REGEXP.exec(
              style.getPropertyValue('background-image')
            )
            // Using "g" flag with a regex we have to manually break down lastIndex to zero after every usage
            // More details here: https://stackoverflow.com/questions/1520800/why-does-a-regexp-with-global-flag-give-wrong-results
            BI_SRC_REGEXP.lastIndex = 0

            if (matchedSRC && matchedSRC[1] && !el.src) {
              // Replacing element only of there are no content inside, b/c might remove important div with content.
              // Article example: http://www.josiahzayner.com/2017/01/genetic-designer-part-i.html
              // DIV with class "content-inner" has `url("https://resources.blogblog.com/blogblog/data/1kt/travel/bg_container.png")` background image.
              if (!el.textContent) {
                const img = document.createElement('img')
                img.src = matchedSRC[1]
                el && el.parentNode && el.parentNode.replaceChild(img, el)
              }
            }
          }
        }
      })
      return document.documentElement.outerHTML
    })

    sanitizeSource(domContent, callbackFn)
  } catch (error) {
    console.error('Error occured while fetching content')
    console.error(error)
  } finally {
    await page.close()
    await browser.close()
  }
}

function sanitizeSource(html, callbackFn) {
  htmltidy(
    html,
    {
      indent: true,
      'indent-spaces': 4,
      'numeric-entities': true,
      'output-xhtml': true,
      wrap: 0,
    },
    callbackFn
  )
}

function onResponseReceived(error, source, destRoot, options) {
  if (error) {
    console.error("Couldn't tidy source html!")
    console.error(error)
    return
  }
  if (debug) {
    console.log('writing')
  }
  var sourcePath = path.join(destRoot, 'source.html')
  fs.writeFile(sourcePath, source, async function (err) {
    if (err) {
      console.error("Couldn't write data to source.html!")
      console.error(err)
      return
    }
    if (debug) {
      console.log('Running readability stuff')
    }
    await runReadability(
      source,
      path.join(destRoot, 'expected.html'),
      path.join(destRoot, 'expected-metadata.json'),
      options
    )
  })
}

async function runReadability(source, destPath, metadataDestPath, options) {
  console.log('running readability')

  var uri = 'http://fakehost/test/page.html'
  var myReader, result, readerable
  try {
    // Use linkedom for isProbablyReaderable because it supports querySelectorAll
    var dom = parseHTML(source).document
    readerable = isProbablyReaderable(dom)
    // We pass `caption` as a class to check that passing in extra classes works,
    // given that it appears in some of the test documents.
    myReader = new Readability(dom, {
      classesToPreserve: ['caption'],
      url: uri,
      ...options,
    })
    result = await myReader.parse()
  } catch (ex) {
    console.error(ex)
    ex.stack.forEach(console.log.bind(console))
  }
  console.log('result', result)
  if (!result) {
    console.error(
      'No content generated by readability, not going to write expected.html!'
    )
    return
  }

  fs.writeFile(destPath, prettyPrint(result.content), function (fileWriteErr) {
    if (fileWriteErr) {
      console.error("Couldn't write data to expected.html!")
      console.error(fileWriteErr)
    }

    // Delete the result data we don't care about checking.
    delete result.content
    delete result.textContent
    delete result.length
    delete result.documentElement

    // Add isProbablyReaderable result
    result.readerable = readerable

    fs.writeFile(
      metadataDestPath,
      JSON.stringify(result, null, 2) + '\n',
      function (metadataWriteErr) {
        if (metadataWriteErr) {
          console.error("Couldn't write data to expected-metadata.json!")
          console.error(metadataWriteErr)
        }
      }
    )
  })
}

if (process.argv.length < 3) {
  console.error(
    "Need at least a destination slug and potentially a URL (if the slug doesn't have source)."
  )
  process.exit(0)
}

if (process.argv[2] === 'all') {
  fs.readdir(testcaseRoot, function (err, files) {
    if (err) {
      console.error('error reading testcases')
      return
    }

    files.forEach(function (file) {
      generateTestcase(file)
    })
  })
} else {
  generateTestcase(process.argv[2])
}
