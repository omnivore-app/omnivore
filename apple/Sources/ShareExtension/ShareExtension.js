var ShareExtension = function() {};

ShareExtension.prototype = {
    run: function(arguments) {
        arguments.completionFunction({
          'url': window.location.href,
          'title': document.title.toString(),
          'documentHTML': new XMLSerializer().serializeToString(document),
        });
    }
};

var ExtensionPreprocessingJS = new ShareExtension();
