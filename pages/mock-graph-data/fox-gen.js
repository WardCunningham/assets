// read vensim formulas from our first js translation, emit as an equivalent graph
// usage: deno run allow-read=. fox-gen.js

import {Graph} from 'http://ward.dojo.fed.wiki/assets/pages/mock-graph-data/graph.js'
const graph = new Graph()
const exprs = []
const nids = {}
const src = Deno.readTextFileSync('./fox-sim.js')
for (const para of src.split(/\n\n+/)) {
  if (para.match(/^\/\/ \(\d+\)/)) {
    console.error(para)
    const lines = para.replace(/\/\/ /g,'').split(/\n/)
    const [what,rest] = lines[0].split(/ *= */)
    const label = what.slice(0,4)
    const funct = what.slice(5)
    let defn = rest.trim()
    let i = 1
    if(!lines[i].startsWith('Units')) defn += lines[i++].trim()
    if(!lines[i].startsWith('Units')) defn += lines[i++].trim()
    if(!lines[i].startsWith('Units')) defn += lines[i++].trim()
    const units = lines[i++].slice(7)
    const desc = lines[i++]||funct
    console.error({label,funct,defn,units,desc})
    if (defn.match(/^[0-9.]+$/)) {
      nids[funct] = graph.addNode('Const',{name:funct,label,value:+defn,units,desc})
    } else {
      const nid = nids[funct] = graph.addNode('Funct',{name:funct,label,units,desc})
      exprs.push({nid,defn})
    }
  }
}
for (const expr of exprs) {
  const idents = [...expr.defn.matchAll(/\b[\w ]+\b/g)]
  for (const ident of idents) {
    if (ident[0]=='INTEG') continue
    const from = nids[ident[0]]
    const to = expr.nid
    console.error(from,to,ident)
    graph.addRel('Value',from,to,{})
  }
}
console.log(JSON.stringify({nodes:graph.nodes, rels:graph.rels},null,2))