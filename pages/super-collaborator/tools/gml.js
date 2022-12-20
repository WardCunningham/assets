// convert .graph.json argument to gml format
// usage: deno run --allow-read http:hsc.fed.wiki/assets/gml.js sample.graph.json > sample.gml

import {Graph} from 'https://wardcunningham.github.io/graph/graph.js'

const input = await Graph.read(Deno.args[0])
console.error('input',input.tally())
graph(input)

function graph (input) {
  console.log('[')
  input.nodes.forEach(node)
  input.rels.forEach(rel)
  console.log(']')
}

function node (node,id) {
  console.log('  node')
  console.log('  [')
  console.log(`    id N${id}`)
  console.log(`    label "${node.type} ${node.props.name || 'no name'}"`)
  console.log('  ]')
}

function rel (rel) {
  console.log('  edge')
  console.log('  [')
  console.log(`    source N${rel.from}`)
  console.log(`    target N${rel.to}`)
  console.log(`    label "${rel.type}"`)
  console.log('  ]')
}