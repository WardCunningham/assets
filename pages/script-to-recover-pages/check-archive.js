// Check internet archive for scrape of pages from a wiki site
// Usage: deno run --allow-net check-archive.js dojo.fed.wiki > export.html

const asSlug = title => title.replace(/\s/g, '-').replace(/[^A-Za-z0-9-]/g, '').toLowerCase()
const asCopy = obj => JSON.parse(JSON.stringify(obj))
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// S L U G S   F R O M   S E A R C H

const site = Deno.args[0] || 'dojo.fed.wiki'
const search = `http://search.fed.wiki.org:3030`
const slugs = (await fetch(`${search}/sites/${site}/slugs.txt`).then(res => res.text()))
  .split("\n")
  .filter(slug => slug.length)
console.error(site,'site to be recovered')
console.error(slugs.length,'pages indexed in search')


// A R C H I V E   A V A I L A B I L I T Y

const archive = `https://archive.org/wayback/available`
const rows = await Promise.all(slugs.map(slug =>
  fetch(`${archive}?url=http://${site}/${slug}.html`)
    .then(res => res.json())
    .then(json => ({slug,url:json.url,...json.archived_snapshots.closest}))
))
console.error(rows.filter(row => row.available).length, 'pages available in wayback')


// F E T C H   A R C H I V E   H T M L

for (const row of rows) {
  if(!row.available) continue
  await delay(100)
  row.html = await fetch(row.url)
    .then(res => res.text())
    .catch(err => {console.error(err); return null})
}
console.error(rows.filter(row => row.html).length, 'html pages retrieved')


// A P P R O X I M A T E   P A G E   J S O N

const exportfile = {}
for (const row of rows) {
  if(!row.available || !row.html) continue
  const [_,YYYY,MM,DD,hh,mm,ss] = row.timestamp.match(/(....)(..)(..)(..)(..)(..)/)
  const date = Date.parse(`${YYYY}-${MM}-${DD} ${hh}:${mm}:${ss}Z`)
  const title = row.html.match(/<title>(.*?)<\/title>/)[1]
  const story = []
  const text = row.html.match(/<div class="item paragraph"><p>(.*?)<\/p><\/div>/)[1]
  story.push({type:'paragraph', text})
  exportfile[row.slug]=finishpage({title,story},date)
}
console.error(Object.keys(exportfile).length,'partial pages restored')


// C O M P L E T E   A N D   D O W N L O A D   E X P O R T   F I L E

function finishpage(page,date) {
  for (const item of page.story)
    item.id ||= (Math.random()*10**20).toFixed(0)
  page.journal ||= [{type:'create', date, item:asCopy(page)}]
  return page
}

console.log(JSON.stringify(exportfile))
