
const asSlug = (title) => title.replace(/\s/g, '-').replace(/[^A-Za-z0-9-]/g, '').toLowerCase()

let counters = {}

export const count = (counter, count=1) => {
  counters[counter] = counters[counter] || 0
  counters[counter] += count
}

    // td, th { border: 1px solid gray; padding: 8px; }
    // table { border-collapse: collapse; }

export const counts = () => `
  <table border=1 cellpadding=8 style="border-collapse: collapse;">
    ${Object.keys(counters).sort().map(k =>
      `<tr><td style="text-align:right">${counters[k].toLocaleString()}<td>${k}`).join("\n")}
  </table>`


let troubled = {}

export const trouble = (prob, title) => {
  count('troubles reported')
  let list = troubled[prob] = troubled[prob] || []
  if(!list.includes(title)) list.push(title)
}

export const troubles = () => {
  let keys = Object.keys(troubled)
  if (!keys.length)
    return [{type:'paragraph', text:'No problems encountered.'}]
  else
   return keys.sort().map(key => ({
    type:'paragraph',
    text:`${key} ⇒ ${troubled[key].map(title => `[[${title}]]`).join(', ')}`
  }))
}

let preferred = {} // slug => title
export const prefer = title => preferred[asSlug(title)] || (preferred[asSlug(title)] = title)

export const recount = () => {
  counters = {}
  troubled = {}
  preferred = {}
}