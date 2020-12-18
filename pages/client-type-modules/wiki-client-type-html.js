// Smallest plugin for html

export { emit, bind }

function emit($item, item) {
  let html = item.text
  if($item)
    $item.innerHTML = html
  else
    return html
}

function bind($item, item) {

}
