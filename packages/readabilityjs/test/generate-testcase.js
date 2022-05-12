var debug = false;

var path = require("path");
var fs = require("fs");
var prettyPrint = require("./utils").prettyPrint;
var htmltidy = require("htmltidy2").tidy;

var { Readability, isProbablyReaderable } = require("../index");
var JSDOMParser = require("../JSDOMParser");
const { generate: generateRandomUA } = require("modern-random-ua/random_ua");
const puppeteer = require('puppeteer');
const { parseHTML } = require("linkedom");

var testcaseRoot = path.join(__dirname, "test-pages");

var argURL = process.argv[3]; // Could be undefined, we'll warn if it is if that is an issue.

function generateTestcase(slug) {
  var destRoot = path.join(testcaseRoot, slug);

  fs.mkdir(destRoot, function (err) {
    if (err) {
      var sourceFile = path.join(destRoot, "source.html");
      fs.exists(sourceFile, function (exists) {
        if (exists) {
          fs.readFile(sourceFile, { encoding: "utf-8" }, function (readFileErr, data) {
            if (readFileErr) {
              console.error("Source existed but couldn't be read?");
              process.exit(1);
            }
            onResponseReceived(null, data, destRoot);
          });
        } else {
          fs.writeFile(path.join(destRoot, 'url.txt'), argURL, () => null);
          fetchSource(argURL, function (fetchErr, data) {
            onResponseReceived(fetchErr, data, destRoot);
          });
        }
      });
      return;
    }
    fs.writeFile(path.join(destRoot, 'url.txt'), argURL, () => null);
    fetchSource(argURL, function (fetchErr, data) {
      onResponseReceived(fetchErr, data, destRoot);
    });
  });
}

async function fetchSource(url, callbackFn) {
  if (!url) {
    console.error("You should pass a URL if the source doesn't exist yet!");
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { height: 1080, width: 1920 },
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();
  const ua = generateRandomUA();
  await page.setUserAgent(ua);

  try {
    /*
    * Disallow MathJax from running in Puppeteer and modifying the document,
    * we shall instead run it in our frontend application to transform any
    * mathjax content when present.
    */
    await page.setRequestInterception(true);
    page.on('request', request => {
      if (
        request.resourceType() === 'script' &&
        request.url().toLowerCase().indexOf('mathjax') > -1
      ) {
        request.abort();
      } else {
        request.continue();
      }
    });

    await page.goto(url, { waitUntil: ['load'] });

    /* scroll with a 5 second timeout */
    await Promise.race([
      new Promise(resolve => {
        (async function () {
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
            })()`);
          } catch (e) {
            console.error('error in scrolling url', { e, url });
            logRecord.scrollError = true;
          } finally {
            resolve(true);
          }
        })();
      }),
      page.waitForTimeout(5000), //5 second timeout
    ]);

    // get document body with all hidden elements removed
    const domContent = await page.evaluate(() => {
      const BI_SRC_REGEXP = /url\("(.+?)"\)/gi;

      Array.from(document.body.getElementsByTagName('*')).forEach(el => {
        const style = window.getComputedStyle(el);

        // Removing blurred images since they are mostly the copies of lazy loaded ones
        if (['img', 'image'].includes(el.tagName.toLowerCase())) {
          const filter = style.getPropertyValue('filter');
          if (filter && filter.startsWith('blur')) {
            el.parentNode && el.parentNode.removeChild(el);
          }
        }

        // convert all nodes with background image to img nodes
        if (!['', 'none'].includes(style.getPropertyValue('background-image'))) {
          const filter = style.getPropertyValue('filter');
          // avoiding image nodes with a blur effect creation
          if (filter && filter.startsWith('blur')) {
            // console.log('\n\n\n\n Filter found: ', filter);
            el && el.parentNode && el.parentNode.removeChild(el);
          } else {
            const matchedSRC = BI_SRC_REGEXP.exec(style.getPropertyValue('background-image'));
            // Using "g" flag with a regex we have to manually break down lastIndex to zero after every usage
            // More details here: https://stackoverflow.com/questions/1520800/why-does-a-regexp-with-global-flag-give-wrong-results
            BI_SRC_REGEXP.lastIndex = 0;

            if (matchedSRC && matchedSRC[1] && !el.src) {
              // Replacing element only of there are no content inside, b/c might remove important div with content.
              // Article example: http://www.josiahzayner.com/2017/01/genetic-designer-part-i.html
              // DIV with class "content-inner" has `url("https://resources.blogblog.com/blogblog/data/1kt/travel/bg_container.png")` background image.
              if (el.innerHTML.length < 25) {
                console.log('Replacing element with image');
                const img = document.createElement('img');
                img.src = matchedSRC[1];
                el && el.parentNode && el.parentNode.replaceChild(img, el);
              } else {
                console.log('Element has too much content: ', el.innerHTML.length);
              }
            }
          }
        }

      });
      return document.documentElement.innerHTML;
    });

    sanitizeSource(domContent, callbackFn);
  } catch (error) {
    console.error('Error occured while fetching content')
    console.error(error)
  } finally {
    await page.close();
    await browser.close();
  }
}

function sanitizeSource(html, callbackFn) {
  htmltidy(parseHTML(html).serialize(), {
    "indent": true,
    "indent-spaces": 4,
    "numeric-entities": true,
    "output-xhtml": true,
    "wrap": 0
  }, callbackFn);
}

function onResponseReceived(error, source, destRoot) {
  if (error) {
    console.error("Couldn't tidy source html!");
    console.error(error);
    return;
  }
  if (debug) {
    console.log("writing");
  }
  var sourcePath = path.join(destRoot, "source.html");
  fs.writeFile(sourcePath, source, function (err) {
    if (err) {
      console.error("Couldn't write data to source.html!");
      console.error(err);
      return;
    }
    if (debug) {
      console.log("Running readability stuff");
    }
    runReadability(source, path.join(destRoot, "expected.html"), path.join(destRoot, "expected-metadata.json"));
  });
}

function runReadability(source, destPath, metadataDestPath) {
  var uri = "http://fakehost/test/page.html";
  var myReader, result, readerable;
  try {
    // Use jsdom for isProbablyReaderable because it supports querySelectorAll
    var jsdom = parseHTML(source).document;
    readerable = isProbablyReaderable(jsdom);
    // We pass `caption` as a class to check that passing in extra classes works,
    // given that it appears in some of the test documents.
    myReader = new Readability(jsdom, { classesToPreserve: ["caption"], url: uri });
    result = myReader.parse();
  } catch (ex) {
    console.error(ex);
    ex.stack.forEach(console.log.bind(console));
  }
  if (!result) {
    console.error("No content generated by readability, not going to write expected.html!");
    return;
  }

  fs.writeFile(destPath, prettyPrint(result.content), function (fileWriteErr) {
    if (fileWriteErr) {
      console.error("Couldn't write data to expected.html!");
      console.error(fileWriteErr);
    }

    // Delete the result data we don't care about checking.
    delete result.content;
    delete result.textContent;
    delete result.length;
    delete result.dom;

    // Add isProbablyReaderable result
    result.readerable = readerable;

    fs.writeFile(metadataDestPath, JSON.stringify(result, null, 2) + "\n", function (metadataWriteErr) {
      if (metadataWriteErr) {
        console.error("Couldn't write data to expected-metadata.json!");
        console.error(metadataWriteErr);
      }
    });
  });
}

if (process.argv.length < 3) {
  console.error("Need at least a destination slug and potentially a URL (if the slug doesn't have source).");
  process.exit(0);
}

if (process.argv[2] === "all") {
  fs.readdir(testcaseRoot, function (err, files) {
    if (err) {
      console.error("error reading testcaseses");
      return;
    }

    files.forEach(function (file) {
      generateTestcase(file);
    });
  });
} else {
  generateTestcase(process.argv[2]);
}
