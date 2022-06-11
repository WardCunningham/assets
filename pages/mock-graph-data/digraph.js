// convert graph to digraph notation used by graphviz
// usage: const dot = `digraph {\n${digraph(graph)}\n}`

export function digraph(graph) {
  const n = graph.nodes.map((n,i) => {
    return `${i} [label="${n.type}\\n${n.props.name}"]`
  })
  const r = graph.rels.map(r => {
    return `${r.from} -> ${r.to} [label="${r.type}"]`
  })
  return [...n, ...r].join("\n")
}