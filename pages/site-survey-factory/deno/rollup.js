// Rollup journal fork survey data as super collaborator graphs
// Usage: deno run --allow-read rollup.js > rollup.jsonl

import {Graph} from 'https://wardcunningham.github.io/graph/graph.js'

const counts = (sum,each) => {
  sum[each] = sum[each] ? sum[each]+1 : 1
  return sum
}

const domains = [...Deno.readDirSync("./data")]
  .map(entry => entry.name)

const beam = []

for (const domain of domains) {
  const survey = JSON.parse(Deno.readTextFileSync(`./data/${domain}`))
  const remotes = survey
    .filter(info => info?.forks?.length)
    .map(info => info.forks[0])
    .filter(domain => domains.includes(domain))
    .reduce(counts,{})
  if(Object.keys(remotes).length) {
    const graph = new Graph()
    graph.addNode('Site',{name:domain})
    for (const remote in remotes)
      graph.addRel(remotes[remote],graph.addNode('Site',{name:remote}),0)
    beam.push({name:domain,graph})
    console.error({domain,tally:graph.tally()})
  }
}

const jsons = beam.map(poem => JSON.stringify(poem))
console.log(jsons.join("\n"))