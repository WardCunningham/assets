// aids for construction of normalized wiki pages from html

export let div = null
export const setdiv = newdiv => div = newdiv
export const asSlug = (title) => title.replace(/\s/g, '-').replace(/[^A-Za-z0-9-]/g, '').toLowerCase()
export const select = s => div.querySelector(s)
export const selectAll = s => [...div.querySelectorAll(s)]

export const more = div => {
  let d = div.nextSibling
  if (!d.innerHTML) {d = d.nextSibling}
  return d
}

export const repeat = advance => {
  const list = []
  do {list.push(advance())}
  while (list[list.length-1])
  list.pop()
  return list
}

export const item = div => {
  const text = `${div.nodeName} ${div.innerHTML}`
  const id = (Math.random()*1000000000).toFixed(0)
  return {type:'paragraph',text,id}
}