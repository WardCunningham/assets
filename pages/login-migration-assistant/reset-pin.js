// update the login secret for a given farm site
// usage: deno run --allow-read --allow-write reset-pin.js 32465 ward.asia.wiki.org

let pin = Deno.args[0]
let site = Deno.args[1]
let path = `.wiki/${site}/status/owner.json`
let owner = JSON.parse(Deno.readTextFileSync(path))
owner['friend'] = {secret:pin}
Deno.writeTextFileSync(path,JSON.stringify(owner,null,2))
console.log(owner)