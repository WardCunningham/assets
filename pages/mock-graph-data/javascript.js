// convert graph to literal notation used by javascript
// usage: const text = javascript(graph)

export function javascript(graph) {
  const n = graph.nodes.map(n => {
    return `{type:'${n.type}',in:[${n.in}],out:[${n.out}],props:{name:'${n.props.name}'}}`
  })
  const r = graph.rels.map(r => {
    return `{type:'${r.type}',from:${r.from},to:${r.to},props:{}}`
  })
  return `new Graph([\n${n.join(",\n")}\n],[\n${r.join(",\n")}\n])`
}