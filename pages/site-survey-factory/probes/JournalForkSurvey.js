// Find the fork history looking back from the current site
// See http://code.fed.wiki/journal-fork-survey-probe.html

export const version = '0.0.1'
import * as index from 'http://code.fed.wiki/assets/v1/index.js'

const uniq = (value, index, self) => self.indexOf(value) === index

export function probe(page) {
  const forks = page.journal
    .reverse()
    .filter(action => action.type=='fork' && action.site)
    .map(action => action.site)
    .filter(uniq)
  return {forks}
}

export function format(survey) {
  return survey
    .filter(info => info.forks.length)
    .map(info => `[[${info.title}]] ${info.forks.join(", ")}`)
    .join("<br>")
}
