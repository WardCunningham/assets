// Smallest plugin for code

export { emit, bind }

function escape(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function expand(line) {
  return line
    .replace(/\b(".*?")\b/g, '<span style="color: #0aa">$1</span>')
    .replace(/\b([0-9.+-]+)\b/g, '<span style="color: #080">$1</span>')
    .replace(/\b([A-Z]{2,})\b/g, '<span style="color: #800">$1</span>')
    .replace(/\b([A-Z][a-z]+)\b/g, '<span style="color: #088">$1</span>')
  }

function emit($item, item) {
  let text = item.text.split(/\r?\n/)
    .map(line => expand(escape(line)))
    .join("\n")
  let code = `<code>${text}</code>`
  let html = `<pre style="background-color: #eee; padding:8px;">${code}</pre>`

  if($item)
    $item.innerHTML = html
  else
    return html
}

function bind($item, item) {

}
