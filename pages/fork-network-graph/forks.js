// Construct Fork Network Graph
// Usage: cd assets/pages/fork-network-graph; deno run --allow-read forks.js > forks.json

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

function record(site,slug,remote) {
  console.error(JSON.stringify({site,slug,remote}))
  let siteid = nodeid('Site',site)
  let slugid = nodeid('Page',slug)
  relid('Slug',siteid,slugid)
  let forkid = nodeid('Fork',`${site}/${slug}`)
  relid('Action',slugid,forkid)
  let remoteid = nodeid('Site',remote)
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
        record(site.name, slug.name, action.site)
      }
    }
  }
}


console.log(JSON.stringify({nodes:g.nodes, rels:g.rels},null,2))
