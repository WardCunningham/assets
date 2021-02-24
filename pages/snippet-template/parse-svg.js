// Find coordinates of boxes in graphviz svg the hard way
// usage: cat basemap.svg | deno run parse-svg.js

let text = new TextDecoder().decode(await Deno.readAll(Deno.stdin))
let lines = text.split(/\n/)
let data = {}

svg()
console.table(data)

function svg() {
  while (lines.length) {
    if (lines[0].startsWith('<!--')) {} else
    if (lines[0].endsWith('-->')) {} else
    if (lines[0] == '') {} else
    if (lines[0].startsWith('<svg')) {} else
    if (lines[0].startsWith('</svg')) {} else
    if (lines[0].startsWith('<g id="graph')) { graph() } else
    { trouble('svg') }
    lines.shift()
  }  
}

function graph() {
  lines.shift()
  while (!lines[0].startsWith('</g')) {
    if (lines[0].startsWith('<!--')) {} else
    if (lines[0].startsWith('<polygon')) {} else
    if (lines[0].startsWith('<g id="node')) { node() } else
    if (lines[0].startsWith('<g id="edge')) { edge() } else
    { trouble('graph') }
    lines.shift()
  }
}

function node() {
  let name, place
  lines.shift()
  while (!lines[0].startsWith('</g')) {
    if (lines[0].startsWith('<!--')) {} else
    if (lines[0].startsWith('<polygon')) { place = polygon() } else
    if (lines[0].startsWith('<title')) { name = title() } else
    if (lines[0].startsWith('<text')) {} else
    if (lines[0].startsWith('<path')) {} else
    { trouble('node') }
    lines.shift()
  }
  data[name] = place
}

function edge() {
  lines.shift()
  while (!lines[0].startsWith('</g')) {
    if (lines[0].startsWith('<!--')) {} else
    if (lines[0].startsWith('<polygon')) {} else
    if (lines[0].startsWith('<title')) {} else
    if (lines[0].startsWith('<text')) {} else
    if (lines[0].startsWith('<path')) {} else
    { trouble('edge') }
    lines.shift()
  }
}

function title() {
  let m = lines[0].match(/<title>(.*?)<\/title>/)
  return m[1]
}

function polygon() {
  let m = lines[0].match(/points="(.*?)"/)
  let p = m[1].split(/ /).map(xy => xy.split(/,/).map(n => Math.round(n)))
  let l = Math.min(...p.map(xy => xy[0]))
  let r = Math.max(...p.map(xy => xy[0]))
  let t = Math.min(...p.map(xy => xy[1]))
  let b = Math.max(...p.map(xy => xy[1]))
  return {center:[(l+r)/2, (t+b)/2], width:r-l, height:t-b}
}

function trouble(rule) {
  console.error(`${rule} can't parse '${line[0]}'`)
}
