/* highlight.js — select text inside `root` to highlight it; click a highlight to remove it.
   Highlights are drawn on a layer on top of the text. The text and its spacing are never touched.
   Usage: const hl = enableHighlight(document.querySelector('#article'), 'hl-marker');
          hl.className = 'hl-squiggle';  // style for new highlights
          hl.clear();                     // remove all
          hl.undo();                      // remove the last highlight
          hl.highlightSelection();        // highlight the current selection (e.g. from a key press) */
function enableHighlight(root, className) {
  const api = { className, items: [] };
  if (getComputedStyle(root).position === 'static') root.style.position = 'relative';
  const layer = document.createElement('div');
  layer.setAttribute('aria-hidden', 'true');
  layer.style.cssText = 'position:absolute;left:0;top:0;width:0;height:0;overflow:visible;pointer-events:none;user-select:none;mix-blend-mode:multiply';
  root.appendChild(layer);

  const textNodes = () => {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const out = []; for (let n = w.nextNode(); n; n = w.nextNode()) if (!layer.contains(n)) out.push(n);
    return out;
  };
  // character offset of a DOM point, counted from the start of root
  const offsetOf = (node, off) => { const r = document.createRange(); r.setStart(root, 0); r.setEnd(node, off); return r.toString().length; };

  // one rectangle per line of text between two offsets, in root coordinates
  function lines(start, end) {
    const box = root.getBoundingClientRect(), ox = box.left + root.clientLeft, oy = box.top + root.clientTop;
    const rects = []; const r = document.createRange(); let pos = 0;
    for (const n of textNodes()) {
      const a = Math.max(start, pos) - pos, b = Math.min(end, pos + n.length) - pos; pos += n.length;
      if (b <= a || !n.nodeValue.trim()) continue;
      r.setStart(n, a); r.setEnd(n, b);
      for (const c of r.getClientRects()) if (c.width > 0.5) rects.push({ x: c.left - ox, y: c.top - oy, w: c.width, h: c.height });
    }
    const merged = [];
    for (const c of rects) {
      const m = merged.find((l) => Math.abs(l.y - c.y) < c.h / 2);
      if (m) { const right = Math.max(m.x + m.w, c.x + c.w); m.x = Math.min(m.x, c.x); m.w = right - m.x; m.h = Math.max(m.h, c.h); }
      else merged.push({ ...c });
    }
    return merged;
  }

  function render() {
    layer.textContent = '';
    for (const it of api.items) {
      it.lines = lines(it.start, it.end);
      for (const l of it.lines) {
        const d = document.createElement('div');
        d.className = it.className;
        d.style.cssText = `position:absolute;box-sizing:border-box;left:${l.x - 2}px;top:${l.y}px;width:${l.w + 4}px;height:${l.h}px`;
        layer.appendChild(d);
      }
    }
  }

  // highlight whatever is selected inside root (returns true if it did)
  api.highlightSelection = () => {
    const sel = getSelection();
    if (!sel.rangeCount || sel.isCollapsed) return false;
    const range = sel.getRangeAt(0);
    if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return false;
    let start = offsetOf(range.startContainer, range.startOffset), end = offsetOf(range.endContainer, range.endOffset);
    const text = root.textContent;
    while (start < end && /\s/.test(text[start])) start++;
    while (end > start && /\s/.test(text[end - 1])) end--;
    sel.removeAllRanges();
    if (end <= start) return false;
    api.items.push({ start, end, className: api.className }); render();
    return true;
  };
  root.addEventListener('mouseup', () => setTimeout(api.highlightSelection));

  root.addEventListener('click', (e) => {
    if (!getSelection().isCollapsed) return;
    const box = root.getBoundingClientRect(), x = e.clientX - box.left - root.clientLeft, y = e.clientY - box.top - root.clientTop;
    for (let i = api.items.length - 1; i >= 0; i--) {
      if (api.items[i].lines.some((l) => x >= l.x - 2 && x <= l.x + l.w + 2 && y >= l.y && y <= l.y + l.h)) { api.items.splice(i, 1); render(); return; }
    }
  });

  // keep highlights aligned when the layout changes
  new ResizeObserver(render).observe(root);
  addEventListener('resize', render);
  if (document.fonts) document.fonts.ready.then(render);

  api.clear = () => { api.items = []; render(); };
  api.undo = () => { api.items.pop(); render(); };
  api.render = render;
  return api;
}
