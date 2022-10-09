// Evaluate graph nodes with dynamic properties, update svg in dom

import {Graph} from './graph.js'

export function start(nodes,graph,msec) {
  const sums = graph.search('match (sum:Variable)').map(res => res.sum)
  const flows = graph.search('match (:Variable)-[flow]->(:Variable)').map(res => res.flow)
  const results = graph.search('match (clock:Simulator)')
  const result = results.find(result => {
    const nid = graph.nodes.findIndex(node => node == result.clock)
    return nodes[nid].textContent.match(/☑/)
  })
  if(!result) return
  const clock = result.clock

  const state = {}
  const dt = clock.props.step || 1
  return setInterval(step, clock.props.msec || 1000)

  function step() {
    const sign = {Increases: 1, Decreases: -1}
    const delta = {}
    const value = nid => state[nid] || graph.nodes[nid].props.value || 0
    for (const node of sums) {
      const nid = graph.nodes.findIndex(n => n === node)
      delta[nid] ||= 0
      delta[nid] += (node.props.wax || 0) * value(nid)
      delta[nid] -= (node.props.wane || 0) * value(nid)
    }
    for (const rel of flows) {
      const idelta = rel.props.irate * value(rel.from)
      const odelta = rel.props.orate * value(rel.to)
      delta[rel.to] += (idelta * odelta) * sign[rel.type]
    }
    for (const nid in delta) {
      state[nid] = value(nid) + .125 * delta[nid]
      nodes[nid].querySelector('text').textContent = state[nid].toFixed(3)
    }
  }
}