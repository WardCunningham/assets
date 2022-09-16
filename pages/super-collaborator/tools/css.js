// convert sticy-studio.json argument to Graph format
// usage: deno run --allow-read http:hsc.fed.wiki/assets/css.js sample.json > sample.graph.json

import {Graph} from 'https://wardcunningham.github.io/graph/graph.js'

const input = await Deno.readTextFileSync(Deno.args[0])
const data = JSON.parse(input)
const g = new Graph()
const nids = {}

data.elements.forEach(e => {
  nids[e._id] = g.addNode('Element',{name:e.attributes.label})
})
data.connections.forEach(c => {
  g.addRel('Connection',nids[c.from],nids[c.to],{name:c.attributes.label})
})

console.error(g.tally())
console.log(g.stringify(null,2))