// tally elements of page_url in preparation for filtering
// usage: cat page_urls* | deno run tally-url-elements.js

import { readLines } from "https://deno.land/std/io/bufio.ts";
const guid = /^[0-9a-f_-]{20,}$/

let tally = {}
let tree = {root:{count:0,children:{}}}
let limit = 100000

for await (let line of readLines(Deno.stdin)) {
  if(line == 'PAGE_URL') continue
  line = line.replace(/"?https:\/\//,'').split(/\?/)[0]
  console.log()
  console.log(line)
  let branch = tree.root
  for (let part of line.split('/')) {
    if (want(part)) {
      if (!tally[part]) {
        tally[part] = 1
      } else {
        tally[part] = tally[part] + 1
      }
    } else {
      part = '*'
    }
    branch.count += 1
    if(!branch.children[part]) {
      branch.children[part] = {count:0,children:{}}
    }
    branch = branch.children[part]
  }
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

// let counts = Object.entries(tally)
//   .filter(entry => entry[1] >= 10 || entry[0].length <= 10)
//   .sort((a,b) => b[1] - a[1])
// for (let count of counts) console.log(count)

// console.log(tree.root)

print ('', 'root', tree.root)
function print (prefix, node, details) {
  console.log(prefix, details.count, node)
  for (let child in details.children)
    print(prefix+' | ', child, details.children[child])
}

Deno.writeTextFile('tree.json',JSON.stringify(tree,null,2))
