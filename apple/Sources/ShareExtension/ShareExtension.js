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
    markHighlightSelection: () => {
      // First remove any previous markers, this would only normally happen during debugging
      try {
        const markers = window.document.querySelectorAll(
          `span[data-omnivore-highlight-start="true"],
           span[data-omnivore-highlight-end="true"]`
        )

        for (let i = 0; i < markers.length; i++) {
          markers[i].remove();
        }
      } catch {
        // This should be OK
      }
      try {
        const sel = window.getSelection();
        if (sel.rangeCount) {
          const range = sel.getRangeAt(0)
          const endMarker = document.createElement("span")
          const startMarker = document.createElement("span")
          endMarker.setAttribute("data-omnivore-highlight-end", "true")
          startMarker.setAttribute("data-omnivore-highlight-start", "true")

          var container = document.createElement("div");
          for (var i = 0, len = sel.rangeCount; i < len; ++i) {
            container.appendChild(sel.getRangeAt(i).cloneContents());
          }

          const endRange = range.cloneRange()
          endRange.collapse(false)
          endRange.insertNode(endMarker)

          range.insertNode(startMarker)

          return {
            highlightHTML: container.innerHTML,
            highlightText: container.innerText
          }
        }
      } catch(error) {
        console.log("ERROR", error)
      }
      return null
    },
    run: function(arguments) {
        const highlightData = this.markHighlightSelection()

        arguments.completionFunction({
          'url': window.location.href,
          'title': document.title.toString(),
          'iconURL': iconURL(),
          'contentType': document.contentType,
          'originalHTML': new XMLSerializer().serializeToString(document),
          ...highlightData
        });
    }
};

var ExtensionPreprocessingJS = new ShareExtension();
