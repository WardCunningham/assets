// convert (n)-[r]->(m) results to graph
// deno run --allow-read=. convert.js > movie.graph.json

import { Graph } from 'https://wardcunningham.github.io/graph/graph.js'

const text = Deno.readTextFileSync('records.json')
const rows = JSON.parse(text)
console.error(rows.length, 'records')

const graph = new Graph()
const adj = (p => {p.name = p.name || p.title; return p})
const nids = {}
for (const row of rows) {
  console.error(row.n.labels[0], row.r.type, row.m.labels[0])
  nids[row.n.identity] = graph.addNode(row.n.labels[0],adj(row.n.properties))
  nids[row.m.identity] = graph.addNode(row.m.labels[0],adj(row.m.properties))
  graph.addRel(row.r.type,nids[row.r.start],nids[row.r.end],row.r.properties)
}
console.error(graph.tally())
console.log(graph.stringify(null,2))
