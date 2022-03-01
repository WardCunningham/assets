// Construct Fork Network Graph
// Usage: cd .wiki/ward.dojo.fed.wiki/assets/pages/fork-network-graph;
//        deno run --allow-read --allow-net forks.js > forks.json

import {Graph} from 'https://raw.githubusercontent.com/WardCunningham/graph/main/src/graph.js'
let g = new Graph()


// F I N D   O R   A D D   E L E M E N T S

const nodeid = (type,name) => {
  let have = g.n(type,{name}).nids
  if(have.length) return have[0]
  return g.addNode(type,{name})
}

const relid = (type,from,to) => {
  let rels = g.rels
  let rids = [...Array(rels.length).keys()]
  let have = rids.filter(rid => {
    let rel=rels[rid];
    return rel.type==type && rel.from==from && rel.to==to
  })
  if(have.length) return have[0]
  return g.addRel(type,from,to)
}

const nodemap = (nodes, doit) => {
  let nids = nodes.nids
  return nids.map(nid => {
    let props = nodes.graph.nodes[nid].props
    return doit(props)
  })
}

function record(site,slug,action) {
  // console.error(JSON.stringify({site,slug,remote:action.site}))
  const datename = epoch => epoch ? new Date(epoch).toLocaleDateString() : 'missing-date'
  let siteid = nodeid('Site',site)
  let slugid = nodeid('Page',slug)
  relid('Slug',siteid,slugid)
  let forkid = g.addNode('Fork',{name:datename(action.date)})
  relid('Action',slugid,forkid)
  let remoteid = nodeid('Site',action.site)
  relid('Remote',forkid,remoteid)
}


// V I S I T   S I T E S   B U I L D I N G   G R A P H

// https://medium.com/deno-the-complete-reference/deno-nuggets-get-list-of-files-in-a-directory-cf6cdfb26c0c
let root = '../../../..'
for await(let site of Deno.readDir(root)) {
  if(site.isFile || !site.name.endsWith('dojo.fed.wiki')) continue;
  for await(let slug of Deno.readDir(`${root}/${site.name}/pages`)) {
    let text = Deno.readTextFileSync(`${root}/${site.name}/pages/${slug.name}`)
    let page = JSON.parse(text)
    for (let action of (page.journal)) {
      if (action.type=='fork' && action.site) {
        record(site.name, slug.name, action)
      }
    }
  }
}

await Promise.all(nodemap(g.n('Site'), props =>
  Deno.resolveDns(props['name'],"A")
    .then(ip => {props['ip'] = ip.join(", ")})
    .catch(err => null)
  )
)

console.error(g.tally())
console.log(JSON.stringify({nodes:g.nodes, rels:g.rels},null,2))
