// Find INSTITUTION nodes and relations in Markdown plugins
// See http://code.fed.wiki/institution-survey-probe.html

export const version = '0.1.0'

import * as index from 'http://code.fed.wiki/assets/v1/index.js'

export function probe(page) {
  const insts = page.story
    .filter(item => item.type == 'markdown')
    .filter(item => item.text.startsWith('INSTITUTION'))
    .map(item => item.text.trim().split("\n"))
    .map(([node,...rels]) => ({
      node:node.trim().replace(/INSTITUTION */,''),
      rels:rels
        .map(line => line.trim())
        .filter(line => line.startsWith('=>'))
        .map(line => line.split(/ *=> */).slice(1))
    }))
  return {insts}
}

export function format(survey) {
  return survey
    .filter(info => info.insts.length)
    .sort((a,b) => a.title>b.title ? 1: -1)
    .map(info => `[[${info.title}]]<br>
      ${info.insts
        .map(inst => `
          <details><summary>${inst.node}</summary>
          ${list(inst.rels)}
          </details>
        `)
        .join("\n")
      }`)
    .join("\n")
}

function list(rels) {
  return rels
    .map(rel => `=> ${rel.join(" => ")}`)
    .join('<br>')
}
