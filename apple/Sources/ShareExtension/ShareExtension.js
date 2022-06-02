var ShareExtension = function() {};

function iconURL() {
  try {
    const previewImage = document.querySelector("meta[property='og:image'], meta[name='twitter:image']").content
    if (previewImage) { return previewImage }

    return document.querySelector("link[rel='apple-touch-icon'], link[rel='shortcut icon'], link[rel='icon']").href
  } catch {}
  return null
}

ShareExtension.prototype = {
    run: function(arguments) {
        arguments.completionFunction({
          'url': window.location.href,
          'title': document.title.toString(),
          'iconURL': iconURL(),
          'contentType': document.contentType,
          'originalHTML': new XMLSerializer().serializeToString(document)
        });
    }
};

var ExtensionPreprocessingJS = new ShareExtension();
