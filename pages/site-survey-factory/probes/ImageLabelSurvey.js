// Find diagram labels within svg images in html plugins
// See http://ward.dojo.fed.wiki/image-label-survey-probe.html

export const version = '0.0.1'

import * as index from 'http://code.fed.wiki/assets/v1/index.js'

export function probe(page) {
  const svgs = page.story
    .filter(item => item.type == 'html')
    .filter(item => item.text.startsWith('<svg'))
  if(!svgs.length) return {labels:[]}
  const div = document.createElement('div')
  div.innerHTML = svgs[0].text
  const labels = [...div.querySelectorAll('text')]
    .map(elem => elem.textContent)
    .filter(text => text.match(/\w/))
  return {labels}
}

export function format(survey) {
  return survey
    .filter(info => info.labels.length)
    .sort((a,b) => a.title>b.title ? 1: -1)
    .map(info => `
      <details><summary>[[${info.title}]]</summary>
      ${list(info.labels)}
      </details>
    `)
    .join("\n")
}

function list(labels) {
  return labels
    .map(label => ` &nbsp; "${label}"`)
    .join('<br>')

}
