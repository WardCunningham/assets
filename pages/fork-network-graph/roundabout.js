// Explore the Dojo Around the Forks
// Usage: deno run --allow-net roundabout.js dojo.fed.wiki

import {Graph} from 'http://ward.dojo.fed.wiki/assets/pages/mock-graph-data/graph.js'
let g = await Graph.fetch('http://ward.dojo.fed.wiki/assets/pages/fork-network-graph/forks.json')
console.log(g.tally())

let n = g.n('Site',{name:Deno.args[0]||'dojo.fed.wiki'})
let p = n.o().t()
let f = p.o().t()

let t = []
for (let i=7; i>0; i--) {
  t.push({sites:n.props().length, pages:p.props().length, forks:f.props().length})
  n = f.o().t()
  p = n.o().t()
  f = p.o().t()
}

console.table(t)