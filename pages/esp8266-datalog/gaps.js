// Find and report gaps in sensor logs
// Usage: deno run --allow-net gaps.js <days>

  const path = `plugin/datalog/esp8266-datalog/day`
  const site = `http://found.ward.bay.wiki.org/${path}`
  const days = +(Deno.args[0]||2)
  const offsets = [...Array(days).keys()].reverse()
  const report = {}
  const logs = offset =>
    fetch(`${site}/${offset}`)
      .then(res => res.text())
      .then(text => text.trim().split(/\n/))
  const data = (await Promise.all(offsets.map(logs))).flat()
  let now = JSON.parse(data.shift()).clock
  const keys = result => result
    .map(obj => Object.keys(obj))
    .flat()
  for(const text of data) {
    const sample = JSON.parse(text)
    if(!keys(sample.result).length) continue
    const dt = sample.clock-now
    if(dt>20000) report[now]=dt
    now = sample.clock
  }
  console.log(report)
