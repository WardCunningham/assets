// find img tags in html plugins

export const version = '0.1.0'

export function probe(page) {
  const items = page.story
    .filter(item => ['paragraph','markdown'].includes(item.type))
    .filter(item => item.text.match(/\w/))
  return {haiku:{
    items:items.length,
    para:linked(items).length}}
}

export function format(survey) {
  const ideal = info => Math.abs(6-info.haiku.para)+Math.abs(3-info.haiku.links)
  return survey
    .sort((a,b) => ideal(a) - ideal(b))
    .map(info => `[[${info.title}]] ${info.haiku.para}/${info.haiku.links}`)
    .join('<br>')
}

function linked(items) {
  const link = /\[\[(.*?)\]\]/g
  const links = []
  let m
  for (const item of items) {
    const text = item.text
    while(m = link.exec(text)) {
      links.push(m[1])
    }
  }
  return links
}
