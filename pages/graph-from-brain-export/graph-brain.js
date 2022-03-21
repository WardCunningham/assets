// Read brain export files to assemble a propery graph
// Usage: deno run --allow-net graph-brain.json

import {Graph} from 'http://ward.dojo.fed.wiki/assets/pages/mock-graph-data/graph.js'

const thoughts = await load('thoughts.json')
const links = await load('links.json')

const g = new Graph()
const nids = {}

for (const t of thoughts) {
  const kinds = ['Zero','One','Two','Three','Four','Five']
  const name = t.Name
  const info = t.ThoughtIconInfo.split(':')[1] || undefined //"3:marc.healthfederation.org:1:True:False:0:"
  const type = kinds[t.Kind]
  const nid = g.addNode(type,{name,info})
  nids[t.Id] = nid
}

for (const l of links) {
  const rels = ['Zeroth','First','Second','Third']
  const kind = l.kind
  const relation = l.Relation
  const direction = l.Direction
  const thickness = l.Thickness
  const from = nids[l.ThoughtIdA]
  const to = nids[l.ThoughtIdB]
  if (from!=undefined && to!=undefined)
    g.addRel(rels[relation],from,to,{kind,relation,direction,thickness})
  else
    console.error('incomplete',{from,to},l)
}

save(g)

async function load(file) {
  const assets = 'http://ward.dojo.fed.wiki/assets/pages/graph-from-brain-export'
  const lines = await fetch(`${assets}/${file}`)
    .then(res => res.text())
    .then(text => text.split(/\r?\n/))
  return lines.filter(line => line).map(line => JSON.parse(line))
}

function save(graph) {
  const nodes = graph.nodes
  const rels = graph.rels
  console.log(JSON.stringify({nodes,rels},null,2))
}
