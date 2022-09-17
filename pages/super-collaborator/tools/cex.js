// convert excalidraw export file as argument to Graph format
// usage: deno run --allow-read http:hsc.fed.wiki/assets/css.js sample.excalidraw > sample.graph.json

import {Graph} from 'https://wardcunningham.github.io/graph/graph.js'

const input = await Deno.readTextFileSync(Deno.args[0])
const data = JSON.parse(input)
const g = new Graph()
const elem = {}
const nids = {}

data.elements.forEach(e => {elem[e.id] = e})
data.elements.filter(e => e.type == 'ellipse').forEach(n => {
  const name = elem[n.boundElements.find(t => t.type == 'text').id].originalText
  nids[n.id] = g.addNode('Element',{name})
})
data.elements.filter(e => e.type == 'arrow').forEach(a => {
  const from = nids[a.startBinding.elementId]
  const to = nids[a.endBinding.elementId]
  g.addRel('Connection',from,to)
})

console.error(g.tally())
console.log(g.stringify(null,2))