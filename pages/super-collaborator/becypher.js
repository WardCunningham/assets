export function becypher(graph) {
  const cypher = []
  const kv = obj => Object.entries(obj)
    .filter(([k,v]) => v)
    .map(([k,v]) => `${k}:${JSON.stringify(v)}`)
    .join(',')
  graph.nodes.forEach((node,nid) =>
    cypher.push(`create (n${nid}:${node.type} {${kv(node.props)}})`))
  graph.rels.forEach(rel =>
    cypher.push(`create (n${rel.from})-[:${rel.type} {${kv(rel.props)}}]->(n${rel.to})`))
  return cypher.join("\n")
}