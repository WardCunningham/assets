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

const gid = div =>
  [...div.innerText.matchAll(/\w+/g)]
    .map(v => v[0])
    .sort()
    .sort((a,b) => b.length - a.length)
    .slice(0,3)
    .join('-')

export const item = div => {
  const text = `${div.nodeName} ${div.innerHTML}`
  return {type:'paragraph',text,id:gid(div)}
}

export const frequent = (selector,nextselector) => {
  const freq = {}
  const count = elem => {
    const klass = elem.className
    freq[klass] = (freq[klass] || 0) + 1}
  div.querySelectorAll(selector)
    .forEach(elem => {
      if (nextselector)
        count(elem.querySelector(nextselector))
      else
        count(elem)
    })
  const counts =  Object.entries(freq)
    .sort((a,b) => b[1] - a[1])
  return counts[0][0]
}