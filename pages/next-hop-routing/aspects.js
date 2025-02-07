// convert data.json to aspects
// usage: deno run --allow-read=. --allow-net aspects.js > remotely.jsonl

import radios from "./data.json" with { type: "json" };
import {Graph} from 'https://wardcunningham.github.io/graph/graph.js'

const fold = name => name.replaceAll(/ /g,'\n')
radios.sort((a,b) => b.pop - a.pop)
console.error(radios[0])
for (const radio of radios.slice(0,50)) {
  const graph = new Graph()
  const nid = graph.addNode('',{name:fold(radio.city),color:'lightblue'})
  for (const path of radio.path) {
    const there = radios.find(radio => radio.zip == path)
    graph.addRel('',nid,graph.addNode('',{name:fold(there.city)}))
  }
  console.log(JSON.stringify({name:`${radio.zip} ${radio.city}`,graph}))
}