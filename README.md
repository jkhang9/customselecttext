# Inkwell

Custom text highlighting for the web. Select text to highlight it, click a highlight to remove it.
Highlights are drawn on a layer on top of the text, so the text and its spacing are never changed.

**Live demo:** https://jkhang9.github.io/customselecttext/

## Use it

```html
<script src="highlight.js"></script>
<script>
  const hl = enableHighlight(document.querySelector('#article'), 'hl-marker');
  hl.className = 'hl-squiggle'; // style for new highlights
  hl.undo();                    // remove the last highlight
  hl.clear();                   // remove all
</script>
```

Pick a style on the demo page and use **Copy CSS** to get its class.

## Shortcuts (demo page)

| Key | Action |
|---|---|
| ⌘Z / Ctrl+Z | Undo the last highlight |
| Shift+Backspace | Remove all highlights |
| C | Copy the CSS for the current style |
| J | Copy the JavaScript |
