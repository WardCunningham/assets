// Sort outbound links into up, down, and other links based on paragraph formatting
// See http://code.fed.wiki/pattern-link-survey-probe.html

export const version = '0.0.1'
const asSlug = (title) => title.replace(/\s/g, '-').replace(/[^A-Za-z0-9-]/g, '').toLowerCase()

export function probe(page) {
  const patterns = {up:[],down:[],other:[]}
  for (const item of page.story||[]) {
    if (item.text) {
      if (item.text.match(/^\s*(\.\.\.|⋯|…|…)/)) addto(item,patterns.up)
      else if (item.text.match(/(\.\.\.|⋯|…|…)\s*$/)) addto(item,patterns.down)
      else addto(item,patterns.other)
    }
    if (item.type == 'graph') {
      const rels = []
      let left, op, right
      for (const line of item.text.split(/\n/)) {
        const tokens = line.trim()
          .split(/\s*(-->|<--|<->)\s*/)
          .filter(token => token)
        for (const token of tokens) {
          if (['<--','-->','<->'].includes(token))
            op = token
          else {
            right = token
            if(left && op && right) {
              switch (op) {
              case '-->': rels.push([left,right]); break
              case '<--': rels.push([right,left]); break
              case '<->': rels.push([left,right]); rels.push([right,left]); break            
            }
          }
          left = right
          op = right = null
          }
        }
      }
      patterns.down.push(...rels.filter(rel => rel[0]=='HERE').map(rel => asSlug(rel[1])))
      patterns.up.push(...rels.filter(rel => rel[1]=='HERE').map(rel => asSlug(rel[0])))
    }
  }
  return {patterns}
}

function addto(item,slugs) {
  const patterns = /\[\[(.*?)\]\]/g
  for (const [,link] of item.text.matchAll(patterns)) {
    slugs.push(asSlug(link))
  }
}

export function format(survey) {
  return survey
    .map(info => `[[${info.title}]] ${count(info.patterns)}`)
    .sort()
    .join('<br>')
}

function count ({up,down,other}) {
  const legend = `${up.length} ⇒ ${other.length} ⇒ ${down.length}`
  if(!up.length && !down.length) return `<font color=gray>${legend}</font>`
  if(!up.length && down.length) return `<font color=gray>${legend}</font>`
  if(up.length && !down.length) return `<font color=red>${legend}</font>`
  return legend
}