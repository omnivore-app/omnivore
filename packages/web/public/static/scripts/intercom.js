;(function () {
  var w = window

  var ic = w.Intercom

  if (typeof ic === 'function') {
    ic('reattach_activator')

    ic('update', w.intercomSettings)
  } else {
    var d = document

    var i = function () {
      i.c(arguments)
    }

    i.q = []

    i.c = function (args) {
      i.q.push(args)
    }

    w.Intercom = i

    var l = function () {
      setTimeout(function () {
        var s = d.createElement('script')
        s.type = 'text/javascript'
        s.async = true
        s.src =
          'https://widget.intercom.io/widget/' + window.intercomSettings.app_id
        var x = d.getElementsByTagName('script')[0]

        x.parentNode.insertBefore(s, x)
      }, 5000)
    }

    if (w.attachEvent) {
      w.attachEvent('onload', l)
    } else {
      w.addEventListener('load', l, false)
    }
  }
})()
