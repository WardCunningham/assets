// Evaluate a Sum-Delta model that is known to oscillate
// Usage: deno run fox-sum.js

import {Graph} from 'http://ward.dojo.fed.wiki/assets/pages/mock-graph-data/graph.js'
import * as sim from './fox-sim.js'

const prey = new Graph([
{type:'Sum',in:[],out:[],props:{name:'Prey',value:100,wax:0.3}}
],[])

const graph = new Graph([
{type:'Sum',in:[1],out:[2],props:{name:'Prey',value:100,wax:0.3}},
{type:'Sum',in:[3],out:[0],props:{name:'Predator',value:10,wane:0.1}},
],[
{type:'Decreases',from:1,to:0,props:{irate:.1,orate:.3}},
{type:'Increases',from:0,to:1,props:{irate:.002,orate:1}}
])

// let obj = { nodes: graph.nodes, rels: graph.rels }
// Deno.writeTextFileSync('Predator.graph.json', JSON.stringify(obj,null,2))
// obj = { nodes: prey.nodes, rels: prey.rels }
// Deno.writeTextFileSync('Prey.graph.json', JSON.stringify(obj,null,2))


const tab = []

const bug = (name, value) => {
  if (name.toLowerCase().startsWith('prey')) {
    tab[tab.length-1][name] = +value.toFixed(3)
  }
}
const bugprops = (node, sufix, value) => {
  const name = node.props.name;
  bug(name+sufix, value)
}

sim.reset()
for(let n=0; n<3; n++) {
  const [prey,pred] = graph.nodes
  tab.push({})
  bug('prey_x', sim.calc('prey_x'))
  bug('prey_inc_rate', sim.calc('prey_increase_rate'))
  bug('prey_dec_rate', -sim.calc('prey_decrease_rate'))
  bugprops(prey, '', calc(prey))
  bug('predators_y', sim.calc('predators_y'))
  bugprops(pred, '', calc(pred))
  sim.step()
  step()
}
console.table(tab)

function calc(node) {
  if (node.type == 'Sum') return node.props.value || 0
  throw 'bad node type'
}

function step() {
  const dt = 1 // 0.125
  const sign = {Increases: 1, Decreases: -1}
  const delta = graph.nodes.map(n => 0)
  for (const node of graph.nodes) {
    const nid = graph.nodes.findIndex(n => n === node)
    delta[nid] += dt * (node.props.wax || 0) * calc(node)
    delta[nid] -= dt * (node.props.wane || 0) * calc(node)
    bugprops(node, ' Δ', delta[nid])
  }
  for (const rel of graph.rels) {
    const bugrel = (sufix, value) => bugprops(graph.nodes[rel.to], sufix,  value)
    const idelta = rel.props.irate * dt * calc(graph.nodes[rel.from])
    const odelta = rel.props.orate * dt * calc(graph.nodes[rel.to])
    delta[rel.to] += (idelta + odelta) * sign[rel.type]
    bugrel(` iΔ`, idelta)
    bugrel(` oΔ`, odelta)
    bugrel(` ΔΔ`, delta[rel.to])
  }
  console.log(delta)
  for (const nid in delta) {
    graph.nodes[nid].props.value += delta[nid]
  }
}

