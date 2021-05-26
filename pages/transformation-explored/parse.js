// Parse mdl file as a dynamic substitute for model.js
// Usage: let model = await parse()

let model = {} // variable => {upstream:[], downstream[]}

export async function parse(url="http://code.fed.wiki/assets/pages/transformation-modeled/Woodcrest%20v7.mdl") {
  let text = await fetch(url).then(req => req.text())
  text = text.replace(/Q /g,'Quality ')
  let part = text.split('********************************************************')[0].replace(/{UTF-8}\r\n/,'')
  let defn = part.split(/\r\n\t\~\t\r\n\t\~\t\t\|\r\n\r\n/)

  for (let line of defn) {
    let [variable, dependents] = line.replace(/\)|\\?\r\n|\t|"/g,'').split(/  \= A FUNCTION OF\( /)
    if(!variable) continue
    let upstream = dependents.split(/,/)
    model[variable] ||= {upstream:[], downstream:[]}
    model[variable].upstream = upstream
    for (let dependent of upstream) {
      model[dependent] ||= {upstream:[], downstream:[]}
      model[dependent].downstream.push(variable)
    }
  }
  // console.log(model)
  return model
}

// parse()