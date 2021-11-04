// tally elements of page_url in preparation for filtering
// usage: cat page_urls* | deno run --allow-read --allow-write=. tally-url-structure.js

import { readLines } from "https://deno.land/std/io/bufio.ts";
const guid = /^[0-9a-f_-]{20,}$/

let stop = JSON.parse(Deno.readTextFileSync('stop.json'))
let tree = {name:'root'}
let limit = 100000

let input = Deno.readTextFileSync(`page_urls_first_one_hundred_K.csv`)

for (let line of input.split(/\r?\n/)) {
  if(line == 'PAGE_URL') continue
  line = line.replace(/"?https:\/\//,'').replace(/\.eu\./,'.').split(/\?/)[0]
  // console.log('line',line)
  let parts = line.split('/').filter(part => want(part) && !stop[part])
  if (!parts.length) continue
  // console.log('parts', parts.join('/'))

  let branch = tree
  let child = null
  // console.log('parts',JSON.stringify(parts))
  for (let part of parts) {
    // console.log('part',part)
    // console.log('branch',JSON.stringify(branch))
    if(!branch.children) {
      child = {name:part}
      branch.children=[{name:part}]
    } else {
      child = branch.children.find(child => child.name == part)
      if (!child) {
        child = {name:part}
        branch.children.push(child)
      }
    }
    branch = child
  }
  if (!child.count) {
    child.count = 0
  }
  child.count += 1

  if (limit-- < 1) break
}

function want (part) {
  if (!part.length) return false                    // ignore empty
  if (/^"?https:$/.test(part)) return false         // ignore https:
  if (/^\d+$/.test(part)) return false              // ignore numbers
  if (guid.test(part)) return false                 // ignore guids
  if (/^\d+_[hi]\d+$/.test(part)) return false      // ignore 000_h0000
  if (/^PAGE_URL$/.test(part)) return false         // ignore heading
  return true
}

Deno.writeTextFileSync('tree.json',JSON.stringify(tree,null,2))
