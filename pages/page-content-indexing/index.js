export const asSlug = title => title.replace(/\s/g, '-').replace(/[^A-Za-z0-9-]/g, '').toLowerCase()
export const asCopy = obj => JSON.parse(JSON.stringify(obj))


// F E T C H

export async function site(domain) {
  const site = domain
  const sitemap = await fetch(`//${site}/system/sitemap.json`).then(res => res.json())
  return {sitemap,info,newer,page,pages}

  function info(title) {
    const slug = asSlug(title)
    return sitemap.find(info => info.slug == slug)
  }

  function newer(epoch) {
    return sitemap
      .filter(info => info.date > epoch)
      .map(info => info.title)
  }

  function page(title) {
    const slug = asSlug(title)
    return fetch(`//${site}/${slug}.json`).then(res => res.json())
  }

  function pages(titles) {
    return Promise.all(
      titles
        .map(title => page(title))
      )
  }
}


// F I N D

export function links(items) {
  const link = /\[\[(.*?)\]\]/g
  const links = []
  let m
  for (const item of items) {
    if(item.type == 'paragraph') {
      const text = item.text
      while(m = link.exec(text)) {
        links.push(m[1])
      }
    }
  }
  return links
}

export function locs(items) {
  const locs = []
  for (const item of items) {
    if(item.type == 'image' && item.location) {
      locs.push([+item.location.latitude, +item.location.longitude])
    }
  }
  return locs
}

export function tags(items,tag) {
  const link = new RegExp(`<${tag}.*?>`,'gi')
  const tags = []
  let m
  for (const item of items) {
    if(item.type == 'html') {
      const text = item.text
      while(m = link.exec(text)) {
        tags.push(m[0])
      }
    }
  }
  return tags
}

export function folds(items) {
  const folds = items
    .map((item, index) => ({item, index}))
    .filter(fold => fold.item.type == 'pagefold')
  return folds.reduce((sum,each,i,a) => {
    if(each.item.text != '.') {
      const upto = (a[i+1]?.index)||9999
      const span = items.slice(each.index+1,upto)
      sum[each.item.text] = span
    }
    return sum
  },{})
}


// I N D E X

export function base(site,finder) {
  let cache = {}
  return {cache: () => cache, index, reload}

  async function reload(url) {
    cache = await fetch(url).then(res => res.json())
  }

  function index(pages) {
    const finds = pages
      .map(page => {
        const title = page.title
        const finds = finder(page.story)
        const info = finds?.length ? {title, finds} : null
        return cache[asSlug(title)] = info
      })
    return finds
  }

}
