// Find all pages with maps and all the static markers they contain
// See http://code.fed.wiki/map-marker-survey-probe.html

export const version = '0.1.0'

export function probe(page) {
  const markers = page.story
    .filter(item => item.type=='map' && item.text)
    .map(item => item.text.split(/\n/)
      .map(line => line.match(/^([0-9\.+-]+),? ?([0-9\.+-]+)\b/))
      .filter(match => match)
      .map(match => [+match[1],+match[2]]))
    .flat()
  return {markers}
}

export function format(survey) {
  return survey
    .filter(info => info.markers.length)
    .map(info => `[[${info.title}]] ${info.markers.length} markers`)
    .join("<br>")
}

export function summary(survey) {
  const text = survey
    .filter(info => info.markers?.length)
    .map(info => `${info.markers[0].join(",")} [[${info.title}]]`)
    .join("\n")
  return {type:'map',text}
}