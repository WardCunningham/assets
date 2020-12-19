// Smallest plugin for pagefold

export { emit, bind }

function escape(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function expand(text) {
  return `<div style="height: 10px; border-top: 2px solid lightgray; margin-top: 24px; text-align: center; position: relative; clear: both;">
      <span style="position: relative; top: -.8em; background: white; display: inline-block; color: gray; ">
        &nbsp; ${text} &nbsp;
      </span>
    </div>`
}

function emit($item, item) {
  let html = expand(escape(item.text))
  if($item)
    $item.innerHTML = html
  else
    return html
}

function bind($item, item) {

}
