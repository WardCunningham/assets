// render graph as dot input to graphviz

export function dotify(complex) {
  const {graph, merged} = complex
  const tip = props => Object.entries(props).filter(e => e[1]).map(e => `${e[0]}: ${e[1]}`).join("\n")
  const nodes = graph.nodes.map((node,id) => {
    const icon = node.props.url ? " 🔗" : ""
    const label = `${node.type}\n${node.props.name}${icon}`
    return `${id} [label="${label}" ${node.props.url?`URL="${node.props.url}" target="_blank"`:''} tooltip="${tip(node.props)}"]`
  })
  const edges = graph.rels.map(rel => {
    return `${rel.from}->${rel.to} [label="${rel.type}" labeltooltip="${tip(rel.props)}"]`
  })
  return [
    'digraph {',
    'node [shape=box style=filled fillcolor=gold]',
    'rankdir=TB',
    ...merged.nids,
    'node [fillcolor=lightgreen]',
    ...nodes,
    ...edges,
    '}'].join("\n")
}