// read nodes and edges from brain json exports
// usage: deno run --allow-read scan.js nodes, edges

import {Graph} from 'https://wardcunningham.github.io/graph/graph.js'

const nodes = read(Deno.args[0])
const edges = read(Deno.args[1])
const nids = {}
const graph = new Graph()

const blocks = ['A Pattern Language','Aggregates']
graph.addNode('Graphviz',{
  name:'Brain Colors',
  emphasis:{
    Pattern: "fillcolor=lightblue",
    Thought: "fillcolor=aquamarine"    
  }})

nodes.forEach(node => {
  const name = node.Name
  const type = name.match(/^[0-9]/) ? 'Pattern' : 'Thought'
  if ((type=='Thought' && !blocks.includes(name)) || Math.random()<0.15) {
    nids[node.Id] = graph.addNode(type,{name:`${name}`})    
  }
})
edges.forEach(edge => {
  if((edge.ThoughtIdA in nids) && (edge.ThoughtIdB in nids))
    graph.addRel(`n${edge.Relation}`, nids[edge.ThoughtIdA], nids[edge.ThoughtIdB])
})
console.error(graph.tally())
console.log(graph.stringify(null,2))

function read(filename) {
  const text = Deno.readTextFileSync(filename).replace(/./,'').trim()
  console.error(filename, text.length)
  const json = text.split(/\n/).map((line,i) => JSON.parse(line))
  return json
}