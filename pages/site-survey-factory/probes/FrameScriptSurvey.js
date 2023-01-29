// Find scripts invoked within Frame plugins
// See http://ward.dojo.fed.wiki/frame-script-survey-probe.html

export const version = '0.0.6'

import * as index from 'http://code.fed.wiki/assets/v1/index.js'

export function probe(page) {
  const scripts = page.story
    .filter(item => item.type=='frame')
    .map(parse)
  return {scripts}
}

function parse(item) {
  const script = {}
  const lines = item.text.split(/\n/)
  script.url = lines[0]
  return script
}

export function format(survey) {
  const scripts = survey.filter(info => info.scripts.length)
  const assets = scripts
    .filter(info => info.scripts.find(script => script.url.match(/\/assets\//)))
    .map(summary)
    .join("\n")
  const internet = scripts
    .filter(info => info.scripts.find(script => !script.url.match(/\/assets\//)))
    .map(summary)
    .join("\n")
  return '<h3>Assets</h3>'+assets+'<h3>Internet</h3>'+internet
}

function summary(info) {
  return `
    <details>
    <summary>
      [[${info.title}]]
    </summary>
      ${info.scripts.map(show).join('<hr>')}
    </details>
  `
}

function show(script) {
  try {
    const url = new URL(script.url)
    return (['protocol','hostname','port','pathname','search'])
      .map(k => [k,url[k]])
      .filter(([k,v]) => v && v.length)
      .map(([k,v]) => `<span title=${k}>${v}</span>`)
      .join('<br>')
  } catch (e) {
    return script.url
  }
}