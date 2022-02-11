var JSDOM = require("jsdom").JSDOM;
var chai = require("chai");
chai.config.includeStack = true;
var expect = chai.expect;

const isOmnivore = process.env.IS_OMNIVORE;
var testPages = require("./utils").getTestPages(isOmnivore);
var isProbablyReaderable = require("../index").isProbablyReaderable;

describe("isProbablyReaderable - test pages", function () {
  testPages.forEach(function (testPage) {
    var uri = "http://fakehost/test/page.html";
    describe(testPage.dir, function () {
      var doc = new JSDOM(testPage.source, {
        url: uri,
      }).window.document;
      var expected = testPage.expectedMetadata.readerable;
      it("The result should " + (expected ? "" : "not ") + "be readerable", function () {
        expect(isProbablyReaderable(doc)).eql(expected);
      });
    });
  });
});

describe("isProbablyReaderable", function () {
  const makeDoc = (source) => new JSDOM(source).window.document;
  var verySmallDoc = makeDoc("<html><p id=\"main\">hello there</p></html>"); // content length: 11
  var smallDoc = makeDoc(`<html><p id="main">${"hello there ".repeat(11)}</p></html>`); // content length: 132
  var largeDoc = makeDoc(`<html><p id="main">${"hello there ".repeat(12)}</p></html>`); // content length: 144
  var veryLargeDoc = makeDoc(`<html><p id="main">${"hello there ".repeat(50)}</p></html>`); // content length: 600

  it("should only declare large documents as readerable when default options", function () {
    expect(isProbablyReaderable(verySmallDoc), "very small doc").to.be.false; // score: 0
    expect(isProbablyReaderable(smallDoc), "small doc").to.be.false; // score: 0
    expect(isProbablyReaderable(largeDoc), "large doc").to.be.false; // score: ~1.7
    expect(isProbablyReaderable(veryLargeDoc), "very large doc").to.be.true; // score: ~21.4
  });

  it("should declare small and large documents as readerable when lower minContentLength", function () {
    var options = { minContentLength: 120, minScore: 0 };
    expect(isProbablyReaderable(verySmallDoc, options), "very small doc").to.be.false;
    expect(isProbablyReaderable(smallDoc, options), "small doc").to.be.true;
    expect(isProbablyReaderable(largeDoc, options), "large doc").to.be.true;
    expect(isProbablyReaderable(veryLargeDoc, options), "very large doc").to.be.true;
  });

  it("should only declare largest document as readerable when higher minContentLength", function () {
    var options = { minContentLength: 200, minScore: 0 };
    expect(isProbablyReaderable(verySmallDoc, options), "very small doc").to.be.false;
    expect(isProbablyReaderable(smallDoc, options), "small doc").to.be.false;
    expect(isProbablyReaderable(largeDoc, options), "large doc").to.be.false;
    expect(isProbablyReaderable(veryLargeDoc, options), "very large doc").to.be.true;
  });

  it("should declare small and large documents as readerable when lower minScore", function () {
    var options = { minContentLength: 0, minScore: 4 };
    expect(isProbablyReaderable(verySmallDoc, options), "very small doc").to.be.false; // score: ~3.3
    expect(isProbablyReaderable(smallDoc, options), "small doc").to.be.true; // score: ~11.4
    expect(isProbablyReaderable(largeDoc, options), "large doc").to.be.true; // score: ~11.9
    expect(isProbablyReaderable(veryLargeDoc, options), "very large doc").to.be.true; // score: ~24.4
  });

  it("should declare large documents as readerable when higher minScore", function () {
    var options = { minContentLength: 0, minScore: 11.5 };
    expect(isProbablyReaderable(verySmallDoc, options), "very small doc").to.be.false; // score: ~3.3
    expect(isProbablyReaderable(smallDoc, options), "small doc").to.be.false; // score: ~11.4
    expect(isProbablyReaderable(largeDoc, options), "large doc").to.be.true; // score: ~11.9
    expect(isProbablyReaderable(veryLargeDoc, options), "very large doc").to.be.true; // score: ~24.4
  });

  it("should use node visibility checker provided as option - not visible", function () {
    var called = false;
    var options = {
      visibilityChecker() {
        called = true;
        return false;
      }
    };
    expect(isProbablyReaderable(veryLargeDoc, options)).to.be.false;
    expect(called).to.be.true;
  });

  it("should use node visibility checker provided as option - visible", function () {
    var called = false;
    var options = {
      visibilityChecker() {
        called = true;
        return true;
      }
    };
    expect(isProbablyReaderable(veryLargeDoc, options)).to.be.true;
    expect(called).to.be.true;
  });

  it("should use node visibility checker provided as parameter - not visible", function () {
    var called = false;
    var visibilityChecker = () => {
      called = true;
      return false;
    };
    expect(isProbablyReaderable(veryLargeDoc, visibilityChecker)).to.be.false;
    expect(called).to.be.true;
  });

  it("should use node visibility checker provided as parameter - visible", function () {
    var called = false;
    var visibilityChecker = () => {
      called = true;
      return true;
    };
    expect(isProbablyReaderable(veryLargeDoc, visibilityChecker)).to.be.true;
    expect(called).to.be.true;
  });
});
