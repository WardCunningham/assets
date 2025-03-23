// Find the attribution history looking back from the current site
// See http://code.fed.wiki/item-attribution-survey-probe.html

export const version = '0.0.1'
// import * as index from 'http://code.fed.wiki/assets/v1/index.js'

const uniq = (value, index, self) => self.indexOf(value) === index

export function probe(page) {
  const attributions = page.journal
    .reverse()
    .filter(action => action.attribution)
    .map(action => Object.assign({id:action.id}, action.attribution))
  return {attributions}
}

export function format(survey) {
  const count = (array,type) => array.length ? ` ${array.length} ${type}` : ''
  const kind = (info, type, when) => count(info.attributions.filter(when), type)
  const local = info => kind(info, 'local', att => !att.site)
  const remote = info => kind(info, 'remote', att => att.site)
  return survey
    .filter(info => info.attributions.length)
    .map(info => `[[${info.title}]]${local(info)+remote(info)}`)
    .join("<br>")
}

export function summary(survey) {
  const sites = survey
    .filter(info => info.attributions.length)
    .map(info => info.attributions.map(att => att.site))
    .flat()
    .filter(site => site)
    .filter(uniq)
    .sort()
  const titles = site => survey
    .filter(info => info.attributions.some(att => att.site == site))
    .map(info => info.title)
  const htmls = sites.map(site =>
    `<details><summary>
      <img width=16 src=//${site}/favicon.png>
      <span>${site}</span> ${titles(site).length}
    </summary>
      ${titles(site).map(title => 
        `[[${title}]]`
      ).join("<br>")}
    </details>`)
  const text = `${htmls.join("")}<br>`
  return {type:'html',text}
}
