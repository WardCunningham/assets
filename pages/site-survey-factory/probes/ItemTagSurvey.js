// Find trailing >> tags remembering page and paragraph
// See http://ward.dojo.fed.wiki/item-tag-survey-probe.html

export const version = '0.1.0'

import * as index from 'http://code.fed.wiki/assets/v1/index.js'

export function probe(page) {
  try {
    const itemtags = page.story
      .filter(item => item.type == 'paragraph' || item.type == 'markdown')
      .filter(item => item.text.match(/ >>( +[a-z]+)+$/))
      .map(item => {
        const parts = item.text.split(/ +>> +/)
        return {
          text:parts[0],
          tags:parts[1],
          id:item.id
        }
      })
    return {itemtags}
  } catch(e) {
    console.log('Item Tag Probe Error')
    console.log(page.title)
    console.log(e)
    return {itemtags:[]}
  }

}

export function format(survey) {
  return survey
    .filter(info => info.itemtags.length)
    .map(info => `[[${info.title}]]<br>&nbsp; ${info.itemtags.map(item=>item.tags).join("<br>&nbsp; ")}`)
    .sort()
    .join('<br>')
}