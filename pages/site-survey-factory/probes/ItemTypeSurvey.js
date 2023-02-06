// Count the frequency of each item type
// See http://code.fed.wiki/item-type-survey-probe.html

export const version = '0.0.1'

// import * as index from 'http://code.fed.wiki/assets/v1/index.js'

const uniq = (value, index, self) => self.indexOf(value) === index
const cap = word => word.charAt(0).toUpperCase() + word.slice(1)
const counts = (sum,each) => {
  sum[each] = sum[each] ? sum[each]+1 : 1
  return sum
}

export function probe(page) {
  const types = page.story
    .map(item => item.type)
    .reduce(counts,{})
  return {types}
}

export function format(survey) {

  const types = survey
    .map(info => Object.keys(info.types))
    .flat()
    .filter(uniq)
    .sort()

  const totals = {}
  for (const type of types)
    totals[type] = 0
  for (const info of survey) {
    for (const type in info.types) {
      totals[type] += info.types[type]
    }
  }

  types.sort((a,b) => totals[b] - totals[a])
  const html = types
    .map(type => {
      const members = survey
        .filter(info => (type in info.types))
        .map(info => `[[${info.title}]]`)
      return `
        <details><summary>${cap(type)} — ${totals[type]} in ${members.length} pages</summary>
        ${members.join(", ")}
        </details>
      `
    })

  return html.join("\n")
}
