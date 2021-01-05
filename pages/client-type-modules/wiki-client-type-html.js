// Smallest plugin for html

export { emit, bind }

function expand(text) {
  if (typeof document === 'undefined') {
    return text
  }
  // this idiom closes unmatched tags
  let div = document.createElement('div')
  div.innerHTML = text
  return div.innerHTML
}

function emit($item, item) {
  let html = expand(item.text)
  if($item)
    $item.innerHTML = html
  else
    return html
}

function bind($item, item) {

}
