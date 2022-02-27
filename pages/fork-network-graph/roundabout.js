// Explore the Dojo Around the Forks
// Usage: deno run --allow-net roundabout.js dojo.fed.wiki

import {Graph} from 'http://ward.dojo.fed.wiki/assets/pages/mock-graph-data/graph.js'
let g = await Graph.fetch('http://ward.dojo.fed.wiki/assets/pages/fork-network-graph/forks.json')
console.log(g.tally())

let name = Deno.args[0]||'dojo.fed.wiki'
console.log(name)

let n = g.n('Site',{name})
let p = n.o().t()
let f = p.o().t()
let t = []
const row = () => t.push({
  sites:n.props().length,
  pages:p.props().length,
  forks:f.props().length
})
row()
for (let i=6; i>0; i--) {
  n = f.o().t()
  p = n.o().t()
  f = p.o().t()
  row()
}
console.table(t)

let missing = g.n('Site').props()
  .filter(name => name.endsWith('dojo.fed.wiki') && !n.props().includes(name))
  .map(name => name.replace('.dojo.fed.wiki',''))
console.log(missing)