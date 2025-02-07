// convert data.json to aspects by zone
// usage: deno run --allow-read=. --allow-net zones.js > zones.jsonl

import radios from "./data.json" with { type: "json" };
import {Graph} from 'https://wardcunningham.github.io/graph/graph.js'

const fold = name => name.replaceAll(/ /g,'\n')
radios.sort((a,b) => b.pop - a.pop)
console.error(radios[0])

const digits = [1,2,3,4,5,6,7,8,9]
for (const zone of digits) {
  for (const region of digits) {
    const zip = 100*zone + 10*region + 0
    const want = radio => (radio.zip - radio.zip%10) == zip
    const desc = ((a,b) => b.pop - a.pop)
    const have = radios.filter(want).sort(desc)
    if (have.length) {
      const name = `${have[0].zip} ${have[0].city}`
      console.error(name)
      const graph = new Graph()
      for (const radio of have) {
        const nid = graph.addNode(`${radio.zip}`,{name:fold(radio.city),color:'lightblue'})
        for (const path of radio.path) {
          const there = radios.find(radio => radio.zip == path)
          console.error({zone,region,path:`${radio.city} => ${there.city}`})
          graph.addRel('',nid,graph.addNode(`${there.zip}`,{name:fold(there.city)}))
        }        
      }
      console.log(JSON.stringify({name,graph}))
    }
  }
}
