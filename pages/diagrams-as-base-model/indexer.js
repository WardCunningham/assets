// construct index.json from per diagram metadata files.
// usage: (cd docs; deno run --allow-read=. ../scripts/indexer.js > new.json && mv new.json index.json)
// usage: deno run --allow-read=. indexer.js > new.json && mv new.json index.json

import { readJsonSync } from "https://deno.land/std/fs/read_json.ts"
const uniq = (value, index, self) => self.indexOf(value) === index;

let cd = '.'
let rollup = readJsonSync(`${cd}/index.json`)
let version = Deno.readTextFileSync(`${cd}/index.html`).match(/const version = "(.+?)"/)[1]
if (rollup.version != version) console.error('upgrading',{json:rollup.version,html:version})


// let teams = Deno.readDirSync(`${cd}/data`).filter(d => d.isDirectory).map(d => d.name).filter(n => n[0] != '.')
for (let teaminfo of Deno.readDirSync(`${cd}/data`)) {
  if (!teaminfo.isDirectory) continue
  let team = teaminfo.name
  if (team[0] == '.') continue
  if (!rollup.data[team]) {
    console.error('new', {team})
    rollup.data[team] = {}
  }

  // let files = Deno.readDirSync(`${cd}/data/${team}`).filter(d => d.isFile).map(d => d.name)
  let files = []
  for (let fileinfo of Deno.readDirSync(`${cd}/data/${team}`)) {
    if (!fileinfo.isFile) continue
    let file = fileinfo.name
    files.push(fileinfo.name)
  }
  let expected = Object.keys(rollup.data[team]).map(diagram => `${diagram}.${rollup.data[team][diagram].extension}`)
  let missing = expected.filter(file => !files.includes(file))
  if (missing.length) console.error('files',{team, missing})

  for (let file of files) {
    let parts = file.split('.')
    let extension = parts.pop()
    if (['svg','png','jpg','jpeg'].includes(extension)) {
      let diagram = parts.join('.')
      if (!rollup.data[team][diagram]) console.error('new', {team, diagram})
      let meta = {extension}
      if (files.includes(`${diagram}.json`)) {
        meta = readJsonSync(`${cd}/data/${team}/${diagram}.json`)
        for (let thing of Object.keys(meta.things)) {
          if (meta.things[thing] == null) {
            if (spliceout(rollup.data[team][diagram].things, thing)) {
              console.error('delete', {team, diagram, thing})
            }
          }
        }
      } else if (extension == 'svg') {
        meta = {extension, things:svg2things(team,diagram)}
      }
      let things = Object.keys(meta.things || {}).filter(t => meta.things[t] != null).sort()
      if (rollup.data[team][diagram]) {
        let oldthings = rollup.data[team][diagram].things || []
        let newthings = things.filter(t => !oldthings.includes(t))
        if (newthings.length) console.error('new',{team, diagram, things:newthings})
      }
      let types = things.map(t => meta.things[t].type || 'any').filter(uniq).sort()
      let metadata = {extension, things, types}
      if (meta.date) metadata.date = meta.date
      rollup.data[team][diagram] = metadata
      rollup.metadata.types = rollup.metadata.types.concat(types).filter(uniq).sort()
      rollup.version = version
    }
  }
}

function spliceout(array, element) {
  let i = array.indexOf(element)
  if (i >= 0) array.splice(i, 1)
  return (i >= 0)
}

function svg2things(team, diagram) {
  const titles = /<title>([\w\n]+?)<\/title>/g;
  let svg = Deno.readTextFileSync(`${cd}/data/${team}/${diagram}.svg`)
  let m, things = {}
  while((m = titles.exec(svg)) !== null) {
    things[m[1].replace(/\n/g,' ')] = {type:'any'}
  }
  return things
}


console.log(JSON.stringify(rollup,null,2))
