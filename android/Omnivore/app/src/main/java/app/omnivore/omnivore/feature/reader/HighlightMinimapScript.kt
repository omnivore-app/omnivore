package app.omnivore.omnivore.feature.reader

// Injected once per page load. Draws small colored marks next to the scrollbar,
// one per highlight, and scrolls to the highlight when a mark is tapped.
const val HIGHLIGHT_MINIMAP_SCRIPT = """
(function () {
  if (window.__ocMinimap) { window.__ocMinimap.refresh(); return; }
  var gutter = document.createElement('div');
  gutter.id = 'oc-highlight-minimap';
  gutter.setAttribute('role', 'group');
  gutter.setAttribute('aria-label', 'Highlights');
  gutter.style.cssText = 'position:fixed;top:0;bottom:0;right:2px;width:14px;' +
    'z-index:2147483000;pointer-events:none;user-select:none;-webkit-user-select:none;';
  document.body.appendChild(gutter);
  var enabled = window.showHighlightMarkers !== false;

  // Use the color the reader actually renders (theme-aware), so markers always match the text.
  function colorOf(el) {
    var c = getComputedStyle(el).backgroundColor;
    var m = /rgba?\(([^)]+)\)/.exec(c);
    if (!m) return '#FFD234';
    var p = m[1].split(/[,\/ ]+/).filter(Boolean);
    return 'rgb(' + p[0] + ',' + p[1] + ',' + p[2] + ')';
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
    if (!enabled) { gutter.textContent = ''; return; }
    var items = collect(), h = docHeight(), vh = window.innerHeight;
    gutter.textContent = '';
    items.forEach(function (it, n) {
      var y = (it.el.getBoundingClientRect().top + window.pageYOffset) / h * vh;
      var mark = document.createElement('div');
      mark.setAttribute('role', 'button');
      mark.setAttribute('tabindex', '0');
      mark.setAttribute('aria-label', 'Go to highlight ' + (n + 1) + ' of ' + items.length);
      mark.style.cssText = 'position:absolute;right:0;width:14px;height:12px;pointer-events:auto;' +
        'top:' + Math.min(Math.max(y - 6, 0), vh - 12) + 'px;';
      var bar = document.createElement('div');
      bar.style.cssText = 'position:absolute;right:0;top:4px;width:10px;height:4px;border-radius:2px;' +
        'background:' + it.color + ';';
      mark.appendChild(bar);
      mark.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation(); scrollToEl(it.el);
      });
      mark.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault(); e.stopPropagation(); scrollToEl(it.el);
        }
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
  document.addEventListener('omnivoreSetHighlightMarkers', function (event) {
    enabled = event.enabled !== false;
    gutter.style.display = enabled ? '' : 'none';
    if (enabled) refresh();
    else gutter.textContent = '';
  });

  window.__ocMinimap = { refresh: refresh };
  refresh();
})();
"""
