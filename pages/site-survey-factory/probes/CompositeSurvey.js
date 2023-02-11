// Apply several other more focused probes run in tandem.
// See http://code.fed.wiki/composite-survey-probe.html

export const version = '0.0.1'
import * as fss from './FrameScriptSurvey.js'
import * as ics from './ImageCaptionSurvey.js'
import * as its from './ItemTypeSurvey.js'
import * as jfs from './JournalForkSurvey.js'

export function probe(page) {
  const probes = [
    fss.probe(page),
    ics.probe(page),
    its.probe(page),
    jfs.probe(page)
  ]
  return Object.assign({},...probes)
}

export function format(survey) {
  return `
    <details><summary>Frame Script Survey</summary>
      <div style="padding-left:16px;">${fss.format(survey)}</div></details>
    <details><summary>Image Caption Survey</summary>
      <div style="padding-left:16px;">${ics.format(survey)}</div></details>
    <details><summary>Item Type Survey</summary>
      <div style="padding-left:16px;">${its.format(survey)}</div></details>
    <details><summary>Journal Fork Survey</summary>
      <div style="padding-left:16px;">${jfs.format(survey)}</div></details>
  `
}
