// functions that help us tell a linear story read from hypertext

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
