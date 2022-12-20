// retrive live data from federated wiki site

export let site = 'ward.dojo.fed.wiki'
export const asSlug = (title) => title.replace(/\s/g, '-').replace(/[^A-Za-z0-9-]/g, '').toLowerCase()

export const setsite = domain => {
  site = domain
}

export const page = async title => {
  return fetch(`http://${site}/${asSlug(title)}.json`).then(res => res.json())
}

export const fold = async (page, keyword) => {
  const story = (await page).story
  const start = story.findIndex(item => item.type=='pagefold' && item.text==keyword)
  const stop = story.findIndex((item,i) => item.type=='pagefold' && i>start)
  console.log({story,start,stop})
  return story.slice(start+1,stop)
}

export const link = text => {
  return text.split(/\[\[|\]\]/)[1]
}

export const locs = story => {
  const places = story.filter(item => item.type=='image' && item.location)
  return places.map(image => [image.location.latitude,image.location.longitude])
}