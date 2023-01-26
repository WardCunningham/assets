// find img tags in html plugins

import * as index from 'http://code.fed.wiki/assets/v1/index.js'

export function probe(page) {
  return {img:index.tags(page.story,'img')}
}

export function format(survey) {
  return survey
    .filter(info => info.img.length)
    .map(info => info.title)
    .sort()
    .map(title => `[[${title}]]`)
    .join('<br>')
}
