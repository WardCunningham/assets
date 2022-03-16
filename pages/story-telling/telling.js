// functions that help us tell a linear story read from hypertext

export let sitemaps = {}

export const wordcount = story => story.reduce((sum,item) => sum + (item.text||'').split(/\s+/).length, 0)

export const checks = item => item.text.split(/\n/).filter(line => line.startsWith('- [x]'))

export function folded(story, wanted) {
  let have = story
    .filter(item => item.type == 'pagefold')
    .map(item => [item.text, story.indexOf(item)])
  let entries = wanted.map(label => {
    let got = have.findIndex(fold => fold[0] == label)
    if (got == -1) {throw `can't find expected pagefold: "${label}"`}
    let start = have[got][1]+1
    let end = got+1<have.length ? have[got+1][1] : story.length+1
    return [label, story.slice(start,end)]
  })
  return Object.fromEntries(entries)
}

export function linked(story) {
  let links = []
  const link = /\[\[(.*?)\]\]/g
  let match
  for (let item of story) {
    if (item.type == 'reference') links.push(item.title)
    let text = item.text
    while (match = link.exec(text)) {
      links.push(match[1])
    }
  }
  return links
}

export function visit(page) { // deprecated, use links
  let links = []
  const link = /\[\[(.*?)\]\]/g
  let match
  for (let item of page.story) {
    if (item.type == 'reference') links.push(item.title)
    let text = item.text
    while (match = link.exec(text)) {
      links.push(match[1])
    }
  }
  return links
}

async function fastfetch(resource) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), 5000)
  const response = await fetch(resource, {signal: controller.signal})
  clearTimeout(id)
  return response
}

export async function getfrom(slug, sites) {
  let need = sites.filter(site => !sitemaps[site])
  await Promise.all(need.map(site => fastfetch(`//${site}/system/sitemap.json`)
    .then(res => res.ok ? res.json() : [])
    .catch(err => [])
    .then(infos => {sitemaps[site]=infos})))
  let site = sites.find(site => sitemaps[site].filter(info => info.slug == slug).length)
  if (site) {
    let page = await fastfetch(`//${site}/${slug}.json`).then(res => res.json())
    let refs = page.story
      .filter(item => item && item.type == 'reference')
      .reduce((set,item) => set.add(item.site), new Set([site]))
    let all = (page.journal||[])
      .filter(action => action.site)
      .reverse()
      .reduce((set,action) => set.add(action.site), refs)
    return {site, page, sites:[...all]}
  } else {
    return {}
  }
}