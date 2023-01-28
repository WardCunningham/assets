// Record five indicators of unusually large pages
// See http://ward.dojo.fed.wiki/biggest-pages-survey-probe.html

export const version = '0.1.0'

const keys = ['json','story','text','edits','title']

export function probe(page) {
  const json = Math.round(JSON.stringify(page,null,2).length/1000)
  const story = page.story.length
  const text = Math.max(...page.story.map(item => item.text?.length || 0))
  const edits = page.journal.length
  const title = page.title.length
  return {big:{json,story,text,edits,title}}
}

export function format(survey) {
  const th = `<tr><th>page<th>${keys.join('<th>')}`
  const td = row => `<tr><td>[[${row.title}]]<td>${keys.map(k => row.big[k]||0).join('<td>')}`
  const tops = keys
    .map(k => survey.sort((a,b) => b.big[k] - a.big[k]).slice(0,10))
  const html = []
  for (const k of keys) {
    html.push(`<h3> biggest ${k}</h3>`)
    html.push(`<table>`)
    html.push(th)
    const tab = tops[keys.indexOf(k)]
    for (const row of tab)
      html.push(td(row))
    html.push(`</table>`)
  }
  return html.join("\n")
}