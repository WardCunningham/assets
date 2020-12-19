// Smallest plugin for markdown

export { emit, bind }

function escape(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function expand(line) {
  if (line.startsWith('#')) {
    line = line.replace(/^\#+ +/,'')
    return `<h3>${line}</h3>`
  } else if (line == '') {
    return '<br>'
  } else {
    return line
  }
}

function emit($item, item) {
  let html = item.text.split(/\r?\n/).map(line => expand(escape(line))).join("\n")
  if($item)
    $item.innerHTML = html
  else
    return html
}

function bind($item, item) {

}
