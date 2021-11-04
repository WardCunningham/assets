// tally elements of page_url in preparation for filtering
// usage: cat page_urls* | deno run --allow-read --allow-write=. tally-url-structure.js

import { readLines } from "https://deno.land/std/io/bufio.ts";
const guid = /^[0-9a-f_-]{20,}$/

let stop = JSON.parse(Deno.readTextFileSync('stop.json'))
let tree = {count:0,children:{}}
let limit = 1000

for await (let line of readLines(Deno.stdin)) {
  if(line == 'PAGE_URL') continue
  line = line.replace(/"?https:\/\//,'').split(/\?/)[0]
  let parts = line.split('/').filter(part => want(part) && !stop[part])
  console.log(parts.json('/'))

  // let branch = tree
  // for (let part of ) {
  //   if (!want(part) || stop[part]) part = '*'
  //   branch.count += 1
  //   if(!branch.children[part]) {
  //     branch.children[part] = {count:0,children:{}}
  //   } else {
  //     branch.children[part].count += 1
  //   }
  //   branch = branch.children[part]
  // }
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
