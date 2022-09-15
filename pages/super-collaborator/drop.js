// read named graph files that have been dropped by event

import {Graph} from './graph.js'

export async function drop (event,sufix) {
  let files
  if (event.dataTransfer.items) {
    files = [...event.dataTransfer.items]
      .filter(item => item.kind === 'file')
      .map(item => item.getAsFile())
  } else {
    files = [...event.dataTransfer.files]
  }
  const want = files.filter(file =>
    file.name.endsWith(sufix) &&
    file.type === 'application/json')
  const concepts = []
  for (const file of want) {
    const name = file.name.replace(sufix,'')
    const graph = await file.text()
      .then(text => JSON.parse(text))
      .then(({nodes,rels}) => {return new Graph(nodes, rels)})
    concepts.push({name, graph})
  }
  return concepts
}
