// update the owner name for a given farm site
// usage: deno run --allow-read --allow-write reset-name.js "Ward Cunningham" ward.asia.wiki.org

let name = Deno.args[0]
let site = Deno.args[1]
let path = `.wiki/${site}/status/owner.json`
let owner = JSON.parse(Deno.readTextFileSync(path))
owner.name = name
Deno.writeTextFileSync(path,JSON.stringify(owner,null,2))
console.log(owner)