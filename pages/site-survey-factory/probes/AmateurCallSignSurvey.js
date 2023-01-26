// Find amateur call signs in text of any items
// See http://ft8.ward.asia.wiki.org/call-sign-survey-probe.html

import * as index from 'http://code.fed.wiki/assets/v1/index.js'
const uniq = (value, index, self) => self.indexOf(value) === index

export function probe(page) {
  console.log('probe',page.title)
  if(page.title == 'Amateur Call Sign Survey') return {calls:[]}
  const calls = page.story
    .filter(item => item.text)
    .map(search)
    .flat()
    .sort()
    .filter(uniq)
  console.log('calls',calls)
  return {calls}
}

export function format(survey) {
  return survey
    .filter(info => info.calls?.length)
    .map(info => `[[${info.title}]] ⇒ ${info.calls.join(", ")}`)
    .sort()
    .join('<br>')
}

function search(item) {
  let text = item.text
    .replaceAll(/\[\[(.*?)\]\]/g,'$1')
    .replaceAll(/\[.*? (.*?)\]/g,'$1')
  const regexp = /\b[A-Z]{1,2}\d{1,2}[A-Z]{1,3}\b/gi
  const found = []
  let match
  for(const line of text.split(/\n/)) {
    console.log('line',line)
    while((match = regexp.exec(line)) !== null) {
      found.push(match[0].toUpperCase())
    }    
  }

  return found
}