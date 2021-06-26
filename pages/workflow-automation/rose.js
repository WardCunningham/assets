// Construct octo-associtivity graph
// Usage: deno run --allow-net rose.js | dot -Tsvg > rose.svg

let trails = []
let dot = []

let origin
let octants

fetch('http://trails.ward.asia.wiki.org/places-i-have-been.json')
  .then(res => res.json())
  .then(page => parse(page.story[0].text))

function parse(markup) {
  for (let line of markup.split(/\r?\n/)) {
    let m = line.match(/(\d+\.\d+), (-\d+\.\d+) *\[\[(.*?)\]\]/)
    if (m) {
      let [all,lat,lon,link] = m
      trails.push({lat:+lat, lon:+lon, link})
    }
  }
  for (let trail of trails) {
    draw(trail)
  }
  console.log(`strict graph {node [shape=box style=filled fillcolor=gold]\n${dot.join("\n")}\n}`)
}

function draw(where) {
  if(!where.link) return
  console.error('where',where.link)
  octants = {0:[], 1:[], 2:[], 3:[], 4:[], 5:[], 6:[], 7:[]}
  let chunk = 3
  for (let trail of trails) {
    let dy = trail.dx = (trail.lat - where.lat) * 69.05
    let dx = trail.dy = (trail.lon - where.lon) * 48.99
    trail.r = Math.sqrt(dx*dx + dy*dy)
    let angle = Math.round(180*Math.atan2(dx,dy)/Math.PI+360) % 360
    trail.t = Math.floor((angle+360+45/2)/45%8)
  } 
  trails.sort((a,b) => a.r - b.r)
  origin = trails.slice(0,chunk)
  let remains = trails.slice(chunk,trails.length)
  for (let trail of remains) {
    octants[trail.t].push(trail)
  }
  const quote = trail => `"${trail.link.replace(/ /g,'\n')}"`
  for (let octant in octants) {
    let there = octants[octant][0]
    if (there && there.link) dot.push(`${quote(where)} -- ${quote(there)}`)
  }
}
