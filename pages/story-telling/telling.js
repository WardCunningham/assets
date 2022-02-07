// functions that help us tell a linear story read from hypertext

let sitemaps = {}

export const wordcount = story => story.reduce((sum,item) => sum + (item.text||'').split(/\s+/).length, 0)

export const checks = item => item.text.split(/\n/).filter(line => line.startsWith('- [x]'))

export function visit(page) {
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

export async function getfrom(slug, sites) {
  let need = sites.filter(site => !sitemaps[site])
  await Promise.all(need.map(site => fetch(`//${site}/system/sitemap.json`)
    .then(res => res.json())
    .then(infos => {sitemaps[site]=infos})))
  let site = Object.keys(sitemaps).find(site => sitemaps[site].filter(info => info.slug == slug).length)
  console.log({slug,sites,sitemaps,site})
  if (site) {
    let page = await fetch(`//${site}/${slug}.json`).then(res => res.json())
    let refs = page.story
      .filter(item => item.site)
      .reduce((set,item) => set.add(item.site), new Set([site]))
    let all = page.journal
      .filter(action => action.site)
      .reverse()
      .reduce((set,action) => set.add(action.site), refs)
    return {site, page, sites:[...all]}
  } else {
    return {}
  }
}