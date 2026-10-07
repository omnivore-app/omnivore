package app.omnivore.omnivore.feature.reader

// Injected once per page load. Draws small colored marks next to the scrollbar,
// one per highlight, and scrolls to the highlight when a mark is tapped.
const val HIGHLIGHT_MINIMAP_SCRIPT = """
(function () {
  if (window.__ocMinimap) { window.__ocMinimap.refresh(); return; }
  var COLORS = {
    yellow: '#FFD234', green: '#32D74B', red: '#FF5D99',
    blue: '#007AFF', orange: '#FF9500', pink: '#FF6BD6'
  };
  var gutter = document.createElement('div');
  gutter.id = 'oc-highlight-minimap';
  gutter.style.cssText = 'position:fixed;top:0;bottom:0;right:2px;width:14px;' +
    'z-index:2147483000;pointer-events:none;user-select:none;-webkit-user-select:none;';
  document.body.appendChild(gutter);

  function colorOf(el) {
    var m = /highlight__(\w+)/.exec(el.className || '');
    return COLORS[m ? m[1] : 'yellow'] || COLORS.yellow;
  }

  function collect() {
    var groups = {}, order = [];
    var spans = document.querySelectorAll('span.highlight, [omnivore-highlight-id]');
    for (var i = 0; i < spans.length; i++) {
      var el = spans[i];
      var id = el.getAttribute('omnivore-highlight-id') || ('idx' + i);
      if (!groups[id]) { groups[id] = { el: el, color: colorOf(el) }; order.push(id); }
    }
    return order.map(function (id) { return groups[id]; });
  }

  function docHeight() {
    var s = document.scrollingElement || document.documentElement;
    return Math.max(s.scrollHeight, 1);
  }

  function scrollToEl(el) {
    var top = el.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({ top: Math.max(0, top - window.innerHeight / 3), behavior: 'smooth' });
  }

  function refresh() {
    var items = collect(), h = docHeight(), vh = window.innerHeight;
    gutter.textContent = '';
    items.forEach(function (it) {
      var y = (it.el.getBoundingClientRect().top + window.pageYOffset) / h * vh;
      var mark = document.createElement('div');
      mark.style.cssText = 'position:absolute;right:0;width:14px;height:12px;pointer-events:auto;' +
        'top:' + Math.min(Math.max(y - 6, 0), vh - 12) + 'px;';
      var bar = document.createElement('div');
      bar.style.cssText = 'position:absolute;right:0;top:4px;width:10px;height:4px;border-radius:2px;' +
        'background:' + it.color + ';';
      mark.appendChild(bar);
      mark.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation(); scrollToEl(it.el);
      });
      gutter.appendChild(mark);
    });
  }

  var timer = null;
  function schedule() { clearTimeout(timer); timer = setTimeout(refresh, 150); }

  new MutationObserver(function (muts) {
    for (var i = 0; i < muts.length; i++) {
      if (!gutter.contains(muts[i].target)) { schedule(); return; }
    }
  }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
  window.addEventListener('resize', schedule);
  if (window.ResizeObserver) new ResizeObserver(schedule).observe(document.body);

  window.__ocMinimap = { refresh: refresh };
  refresh();
})();
"""
