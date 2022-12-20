// Traverse npl.wiki patterns to make super collaborator upload file
// Usage: deno run --allow-net extract.js > npl.jsonl

import * as live from 'http://trails.ward.asia.wiki.org/assets/pages/leaflet-maps/live.js'
import {Graph} from 'https://wardcunningham.github.io/graph/graph.js'

live.setsite('npl.wiki')
const chapters = ['Scale','Multiple Scale','Process']
const sections = (await Promise.all(chapters.map(cscan))).flat()
const patterns = (await Promise.all(sections.map(sscan))).flat()
await Promise.all(patterns.map(section => section.patterns.map(pscan)).flat())
patterns.forEach(section => emit(section))

async function cscan(chapter){
  const page = await live.page(`Patterns Of ${chapter}`)
  return page.story
    .filter(item => item.type=='markdown')
    .map(links)
    .flat()
}

async function sscan(section){
  const page = await live.page(section)
  return page.story
    .filter(item => item.type=='html')
    .map(item => {
      const patterns = links(item).map(name => ({name}))
      return {section,patterns}
  })
}

async function pscan(pattern) {
  const page = await live.page(pattern.name)
  const items = page.story.filter(item => item.type == 'paragraph')
  pattern.uplinks = links(items.find(item => item.text.startsWith('…')))
  pattern.downlinks = links(items.find(item => item.text.endsWith('…')))
  return pattern
}

function links (item) {
  if(!item) return []
  const links = []
  const regex = /\[\[(.*?)\]\]/g
  let m
  while(m = regex.exec(item.text)) {
    links.push(m[1])
  }
  return links
}

function emit (section) {
  const graph = new Graph()
  const nids = {}
  const pat = name => {
    if(!(name in nids)) {nids[name] = graph.addNode('Pattern',{name})}
    return nids[name]
  }
  graph.addNode('Section',{name:section.section})
  section.patterns.forEach(pattern => {
    const here = pat(pattern.name)
    graph.addRel('Has',0,here)
    pattern.uplinks.forEach(name => graph.addRel('From',pat(name),here))
    pattern.downlinks.forEach(name => graph.addRel('To',here,pat(name)))
  })
  console.log(JSON.stringify({name:section.section,graph:{nodes:graph.nodes,rels:graph.rels}}))
}
