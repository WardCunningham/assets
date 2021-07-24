// Parse mdl file as a dynamic substitute for model.js
// Usage: let model = await parse()

let model = {} // variable => {upstream:[], downstream[]}
let stop = word => ['of','in','to','as','and','for'].includes(word.toLowerCase()) ? word : null

export async function parse(url="http://code.fed.wiki/assets/pages/transformation-modeled/Woodcrest%20v7.mdl") {
  let text = await fetch(url).then(req => req.text())
  text = text.replace(/Q /g,'Quality ').replace(/ & /g,' and ')
  text = text.replace(/\w\S*/g, txt => {return stop(txt) || txt.charAt(0).toUpperCase() + txt.substr(1)})
  let part = text.split('********************************************************')[0].replace(/{UTF-8}\r\n/,'')
  let defn = part.split(/\r\n\t\~\t\r\n\t\~\t\t\|\r\n\r\n/)

  for (let line of defn) {
    const blank = text => !/\S/.test(text)
    let [variable, dependents] = line.replace(/\)|\\?\r\n|\t|"/g,'').split(/  \= A FUNCTION OF\( /)
    if(!variable || blank(variable)) continue
    let upstream = dependents.split(/,/)
    if(blank(upstream[0])) upstream.shift()
    model[variable] ||= {upstream:[], downstream:[]}
    model[variable].upstream = upstream
    for (let dependent of upstream) {
      model[dependent] ||= {upstream:[], downstream:[]}
      model[dependent].downstream.push(variable)
    }
  }
  return model
}

// console.log(await parse())