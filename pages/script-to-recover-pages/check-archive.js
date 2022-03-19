// Check internet archive for scrape of pages from a wiki site
// Usage: deno run --allow-net check-archive.js dojo.fed.wiki

const site = Deno.args[0] || 'dojo.fed.wiki'
const search = `http://search.fed.wiki.org:3030`
const slugs = (await fetch(`${search}/sites/${site}/slugs.txt`).then(res => res.text()))
  .split("\n")
  .filter(slug => slug.length)
console.error({site,slugs})
const archive = `https://archive.org/wayback/available`
const results = await Promise.all(slugs.map(async slug => {
  const info = await fetch(`${archive}?url=http://${site}/${slug}.html`).then(res => res.json())
  return {slug, ...(info.archived_snapshots.closest || {})}
}))
console.table(results)