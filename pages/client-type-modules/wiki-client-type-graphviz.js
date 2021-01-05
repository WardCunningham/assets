// Smallest plugin for graphviz

export { emit, bind }

// from http://frame.wiki.dbbs.co/assets/drop-svg-linkmatic/index.html

function wrapSVG(url, svg) {
 const el = document.createElement('div')
 el.innerHTML = svg
 const svgDOM = el.querySelector('svg')
 // const nodes = svgDOM.querySelectorAll('.node')
 // for (let node of nodes) {
 //   console.log({node})
 //   let anchor = document.createElementNS('http://www.w3.org/2000/svg', 'a')
 //   anchor.setAttribute('target', url.host)
 //   let title = node.querySelector('title').textContent
 //   anchor.setAttribute('href', wikiUrl(url, title))
 //   node.parentElement.replaceChild(anchor, node)
 //   anchor.appendChild(node)
 // }
 const width = svgDOM.getAttribute('width')
 const height = svgDOM.getAttribute('height')
 let viewBox = svgDOM.getAttribute('viewBox')
 if (width && height && ! viewBox) {
   svgDOM.setAttribute('viewBox', `0.0 0.0 ${width} ${height}`)
 }
 svgDOM.removeAttribute('width')
 svgDOM.removeAttribute('height')
 // let button = document.createElement('button')
 // const doc = `<!doctype html><head><meta charset="utf-8"><title>graph</title><style>body, html {width: 100vw; height: 100vh; margin: 0; padding: 0} body {display:flex; flex-direction: row-reverse} svg {flex: 3 3 auto;} iframe {flex: 1 1 auto;}</style></head><iframe src="http://marc.tries.fed.wiki" name="${url.host}"></iframe>${svgDOM.outerHTML}`
 // button.innerText = 'Open Graph in Other Window'
 // button.addEventListener('click', event => {
 //   const win = window.open()
 //   win.document.write(doc)
 // })
 // document.querySelector('#wrapped-svg')
 //         .appendChild(button)
 return svgDOM.outerHTML
}


function emit($item, item) {
  let html = (typeof document !== 'undefined') && item.svg ? wrapSVG(null, item.svg) : ''
  if($item)
    $item.innerHTML = html
  else
    return html
}

function bind($item, item) {

}
