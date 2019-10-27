// Convert graph download from scrape.html to svg
// Usage: cat ~/Downloads/scrape-found.ward.bay.wiki.org-30.json | node scrape.js | dot -Tsvg > scrape.svg

const fs = require('fs');
const graph = JSON.parse(fs.readFileSync(0, 'utf-8'))

function asSlug (title) {
  return title.replace(/\s/g, '-')
    .replace(/[^A-Za-z0-9-]/g, '')
    .toLowerCase()
}

function resolve(node,link) {
  let want = asSlug(link)
  for (let probe of node.sites) {
    if (graph[probe] && graph[probe][want]) {
      return probe
    }
  }
  return null
}

function quote(name) {
  return `"${name}"`
}

console.log('strict digraph {')
console.log('node [shape=box style=filled fillcolor=palegreen]')
console.log('edge [penwidth=2]')
for (let site in graph) {
  for (let slug in graph[site]) {
    let node = graph[site][slug]
    for (let link of node.links) {
      let found = resolve(node, link)
      if (found) {
        console.log(quote(site), '->', quote(found))
      }
    }
  }
}
for (let site in graph) {
  for (let slug in graph[site]) {
    let node = graph[site][slug]
    if (node.sites.length > 1) {
      console.log(quote(site), '->', quote(node.sites[1]), '[style=dotted]')
    }
  }
}
console.log('}')
