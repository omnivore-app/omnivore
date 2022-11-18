var ShareExtension = function() {};

function iconURL() {
  try {
    const previewImage = document.querySelector("meta[property='og:image'], meta[name='twitter:image']").content
    if (previewImage) { return previewImage }

    return document.querySelector("link[rel='apple-touch-icon'], link[rel='shortcut icon'], link[rel='icon']").href
  } catch {}
  return undefined
}

ShareExtension.prototype = {
    getHighlightHTML: function() {
      try {
        var sel = window.getSelection()
        return (function () {
          var html = "";
          var sel = window.getSelection();
          if (sel.rangeCount) {
              var container = document.createElement("div");
              for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                  container.appendChild(sel.getRangeAt(i).cloneContents());
              }
              html = container.innerHTML;
          }
          return html;
        })()
      } catch {
        
      }
      return null
    },
    run: function(arguments) {
        arguments.completionFunction({
          'url': window.location.href,
          'title': document.title.toString(),
          'iconURL': iconURL(),
          'contentType': document.contentType,
          'originalHTML': new XMLSerializer().serializeToString(document),
          'highlightHTML': this.getHighlightHTML()
        });
    }
};

var ExtensionPreprocessingJS = new ShareExtension();
