// add stdin to item on page of site
// usage: date | deno run --allow-env --allow-read --allow-write wikiadd.js site slug plug

let home = Deno.env.get('HOME')
let [site, slug, plug] = Deno.args
let line = new TextDecoder().decode(await Deno.readAll(Deno.stdin))
console.log({home,site,slug,plug,line})

let path = `${home}/.wiki/${site}/pages/${slug}`
let text = await Deno.readTextFile(path)
let page = JSON.parse(text)
let item = page.story.find(item => item.type == plug)
console.log(item)

item.text += line
await Deno.writeTextFile(path, JSON.stringify(page,null,2))
