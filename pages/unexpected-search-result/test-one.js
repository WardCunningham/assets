// try reading one index with minisearch in deno
// usage: deno run --allow-net test.one.js

import MiniSearch from 'https://cdn.skypack.dev/minisearch@3.3.0'
console.log(MiniSearch)

const index = await fetch('http://marc.tries.fed.wiki/system/site-index.json').then(res => res.text())
const miniSearch = MiniSearch.loadJSON(index,{fields: ['title', 'content']})

const search = query => miniSearch.search(query,{
  boost:{ title: 20, content: 2},
  prefix: true,
  combineWith: 'AND'})

// console.log(search('graph merge demo'))
// console.log(search('yx').length)

const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('')
for (const a of alphabet)
  for (const b of alphabet)
    try {console.log(a+b, search(a+b).length)}
    catch (e) {console.log(a+b, e.message)}