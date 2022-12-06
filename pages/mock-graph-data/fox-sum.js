// Evaluate a Sum-Delta model that is known to oscillate
// Usage: deno run fox-sum.js

import {Graph} from 'http://ward.asia.wiki.org/assets/pages/super-collaborator/graph.js'
import {composite} from 'http://ward.asia.wiki.org/assets/pages/super-collaborator/composite.js'
import * as sim from './fox-sim.js'


const prey = new Graph([
{type:'Sum',in:[],out:[],props:{name:'Prey',value:100,wax:0.3}}
],[])

const run = new Graph([
  {type:'Run',in:[],out:[],props:{name:'',start:'0.0',stop:'100.0',step:'0.125'}}
],[])

const predator = new Graph([
{type:'Sum',in:[1],out:[2],props:{name:'Prey'}},
{type:'Sum',in:[3],out:[0],props:{name:'Predator',value:10,wane:0.1}},
],[
{type:'Decreases',from:1,to:0,props:{irate:.1,orate:.1}},
{type:'Increases',from:0,to:1,props:{irate:.002,orate:1}}
])

const bears = new Graph([
  {"type": "Sum","in": [4],"out": [0],"props": {"name": "Bears", "value":10}},
  {"type": "Sum","in": [0],"out": [1],"props": {"name": "Deers", "value":100}},
  {"type": "Sum","in": [1],"out": [2],"props": {"name": "Willow", "value":100}},
  {"type": "Sum","in": [2],"out": [3],"props": {"name": "Songbirds", "value":100}},
  {"type": "Sum","in": [3],"out": [4],"props": {"name": "Berries", "value":100}}
],[
  {"type": "Decreases","from": 0,"to": 1,"props": {"name": "Prey On", "irate":0.1, "orate":0.1}},
  {"type": "Decreases","from": 1,"to": 2,"props": {"name": "Browse On", "irate":0.1, "orate":0.1}},
  {"type": "Increases","from": 2,"to": 3,"props": {"name": "Habitat For", "irate":0.1, "orate":0.1}},
  {"type": "Increases","from": 3,"to": 4,"props": {"name": "Disperse Seeds", "irate":0.1, "orate":0.1}},
  {"type": "Increases","from": 4,"to": 0,"props": {"name": "Food", "irate":0.1, "orate":0.1}}
])

// let obj = { nodes: predator.nodes, rels: predator.rels }
// Deno.writeTextFileSync('Predator.graph.json', JSON.stringify(obj,null,2))
// obj = { nodes: prey.nodes, rels: prey.rels }
// Deno.writeTextFileSync('Prey.graph.json', JSON.stringify(obj,null,2))
// obj = { nodes: run.nodes, rels: run.rels }
// Deno.writeTextFileSync('Run.graph.json', JSON.stringify(obj,null,2))

const graph = composite([
  {name:'prey',graph:prey},
  {name:'predator',graph:predator},
  {name:'run',graph:run}
]).graph

// const graph = bears


const tab = []

const bug = (name, value) => {
  if (name.toLowerCase().startsWith('prey')||true) {
    tab[tab.length-1][name] = +value.toFixed(3)
  }
}
const bugprops = (node, sufix, value) => {
  const name = node.props.name;
  bug(name+sufix, value)
}

const sums = graph.search('match (sum:Sum)').map(res => res.sum)
const flows = graph.search('match (:Sum)-[flow]->(:Sum)').map(res => res.flow)

sim.reset()
for(let n=0; n<400; n++) {
  tab.push({})
  bug('prey_x', sim.calc('prey_x'))
  // bug('prey_inc_rate', sim.calc('prey_increase_rate'))
  // bug('prey_dec_rate', -sim.calc('prey_decrease_rate'))
  // bug('prey_inc/dec', .125*(sim.calc('prey_increase_rate')-sim.calc('prey_decrease_rate')))
  bug('predators_y', sim.calc('predators_y'))
  for (const sum of sums) {
    bug(sum.props.name||sum.type, calc(sum))
  }
  sim.step()
  step()
}
console.table(tab)

function calc(node) {
  if (node.type == 'Sum') return node.props.value || 0
  throw 'bad node type'
}

function step() {
  const sign = {Increases: 1, Decreases: -1}
  const delta = {}
  for (const node of sums) {
    const nid = graph.nodes.findIndex(n => n === node)
    delta[nid] ||= 0
    delta[nid] += (node.props.wax || 0) * calc(node)
    delta[nid] -= (node.props.wane || 0) * calc(node)
    // bugprops(node, ' Δ', delta[nid])
  }
  for (const rel of flows) {
    const idelta = rel.props.irate * calc(graph.nodes[rel.from])
    const odelta = rel.props.orate * calc(graph.nodes[rel.to])
    delta[rel.to] += (idelta * odelta) * sign[rel.type]
    // const bugrel = (sufix, value) => bugprops(graph.nodes[rel.to], sufix,  value)
    // bugrel(` iΔ`, idelta)
    // bugrel(` oΔ`, odelta)
    // bugrel(` ΔΔ`, delta[rel.to])
  }
  for (const nid in delta) {
    graph.nodes[nid].props.value += .125 * delta[nid]
  }
}

