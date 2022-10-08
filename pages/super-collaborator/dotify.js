// render graph as dot input to graphviz

export function dotify(complex) {
  const {graph, merged} = complex
  const tip = props => Object.entries(props).filter(e => e[1]).map(e => `${e[0]}: ${e[1]}`).join("\n")
  const nodes = graph.nodes.map((node,id) => {
    const icon = node.props.url ? " 🔗" : node.props.tick ? " ☐" : ""
    const label = `${node.type}\n${node.props.name}${icon}`
    return `${id} [label="${label}" ${(node.props.url||node.props.tick)?`URL="${node.props.url||'#'}" target="_blank"`:''} tooltip="${tip(node.props)}"]`
  })
  const edges = graph.rels.map(rel => {
    return `${rel.from}->${rel.to} [label="${rel.type}" labeltooltip="${tip(rel.props)}"]`
  })
  const layout = graph.nodes
    .filter(node => node.type == 'Graphviz' && node.props.layout)
    .map(node => node.props.layout)
  return [
    'digraph {',
    `layout = ${layout.reverse()[0]||'dot'}; overlap = false; splines=true`,
    'node [shape=box style=filled fillcolor=gold]',
    'rankdir=TB',
    ...merged.nids,
    'node [fillcolor=lightgreen]',
    ...nodes,
    ...edges,
    '}'].join("\n")
}