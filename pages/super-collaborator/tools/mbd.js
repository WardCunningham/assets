// convert miro board diagram extract to Graph format
// usage: deno run --allow-read http:hsc.fed.wiki/assets/mbd.js sample.json > sample.graph.json

import {Graph} from 'https://wardcunningham.github.io/graph/graph.js'

const input = await Deno.readTextFileSync(Deno.args[0])
const data = JSON.parse(input)
const g = new Graph()
const nids = {}

const card = e => ['card','preview','sticky_note','table','text','document'].includes(e.type)
const connector = e => e.type == 'connector'
const text = t => t ? t.replaceAll(/<.*?>/g,'').slice(0,26) : 'empty'
const link = t => t.split('"')[1]


console.error(data)

data.filter(card).forEach(e => {
  console.error(e)
  nids[e.id] = g.addNode(e.type,{name:text(e.title)})
})
data.filter(connector).forEach(c => {
  console.error(c)
  if(nids[c.start?.item]&&nids[c.end?.item])
    g.addRel(' ',nids[c.start.item],nids[c.end.item])
})

console.error(g.tally())
console.log(g.stringify(null,2))