var getTestPages = require("../test/utils").getTestPages;

var { Readability, isProbablyReaderable } = require("../index");
var JSDOMParser = require("../JSDOMParser");
var { parseHTML } = require("linkedom");

var referenceTestPages = [
  "002",
  "herald-sun-1",
  "lifehacker-working",
  "lifehacker-post-comment-load",
  "medium-1",
  "medium-2",
  "salon-1",
  "tmz-1",
  "wapo-1",
  "wapo-2",
  "webmd-1",
];

var testPages = getTestPages();

if (process.env.READABILITY_PERF_REFERENCE === "1") {
  testPages = testPages.filter(function(testPage) {
    return referenceTestPages.indexOf(testPage.dir) !== -1;
  });
}

suite("JSDOMParser test page perf", function () {
  set("iterations", 1);
  set("type", "static");

  testPages.forEach(function(testPage) {
    bench(testPage.dir + " document parse perf", function() {
      new JSDOMParser().parse(testPage.source);
    });
  });
});


suite("Readability test page perf", function () {
  set("iterations", 1);
  set("type", "static");

  testPages.forEach(function(testPage) {
    var doc = new JSDOMParser().parse(testPage.source);
    bench(testPage.dir + " readability perf", function() {
      new Readability(doc).parse();
    });
  });
});

suite("isProbablyReaderable perf", function () {
  set("iterations", 1);
  set("type", "static");

  testPages.forEach(function(testPage) {
    var doc = parseHTML(testPage.source).document;
    bench(testPage.dir + " readability perf", function() {
      isProbablyReaderable(doc);
    });
  });
});
