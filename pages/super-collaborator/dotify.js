// render graph as dot input to graphviz

export function dotify(complex) {
  const {graph, merged} = complex
  const nodes = graph.nodes.map((node,id) => {
    const label = `${node.type}\n${node.props['name']}`
    return `${id} [label="${label}"]`
  })
  const edges = graph.rels.map(rel => {
    return `${rel.from}->${rel.to} [label="${rel.type}" labeltooltip="${rel.props.source}"]`
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