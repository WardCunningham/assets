// incrementally survey a site using a preconfigured probe
// deno run --allow-read --allow-write --allow-net update.js index.code.fed.wiki

import * as index from '../../page-content-indexing/index.js'
import * as probe from '../probes/JournalForkSurvey.js'

const domain = Deno.args[0] || 'index.code.fed.wiki'
const [site,survey] = await Promise.all([
  index.site(domain),
  load(domain)
])
console.log(domain, index.index(site,survey))
await index.update(site,survey,probe.probe)
store(domain,survey)

async function load(domain) {
  try {
    const text = await Deno.readTextFile(`./data/${domain}`)
    return JSON.parse(text)
  } catch (e) {
    return []
  } 
}

function store(domain,survey) {
  const text = JSON.stringify(survey,null,2)
  Deno.writeTextFileSync(`./data/${domain}`,text,)
}