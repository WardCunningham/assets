// Manage the incremental viewing from one tab in the browser
// Usage: import { start } from "./view.js"; start()

export { start }

let lineup = window.lineup = []

function start () {
  let body = document.getElementsByTagName('body')[0]
  body.innerHTML += `
    <style>
      body {font-family: Arial, Helvetica, sans-serif;}
      section {display:flex; flex-wrap:wrap; height:95%;}
      article {width:300px; padding:8px;}
      footer {width:100%; background-color:#ccc; padding:8px;}
    </style>
    <section>${panels()}</section>
    <footer>${footer()}</footer>`
   body.addEventListener('click',click)
}

function panels() {
  let hash = (location.hash||'view/welcome-visitors').replace(/(^[\/#]+)|(\/+$)/g,'')
  let fields = hash.split('/')
  let html = []
  while (fields.length) {
    let [site,slug] = fields.splice(0,2)
    let pid = Math.floor(Math.random()*1000000)
    html.push(`<article id=${pid}><h3>${slug}</h3></article>`)
    let url = site=='view' ? `./${slug}.json` : `//${site}/${slug}.json`
    let panel = {pid,site,slug,url}
    lineup.push(panel)
    fetch(url).then(res => res.json()).then(json => {panel.page = json; refresh(panel)})
  }
  return html.join("\n")
}

function footer() {
  return `<span>smallest wiki revisited</span>`
}

async function refresh(panel) {
  let url = panel.site=='view' ? `./favicon.png` : `//${panel.site}/favicon.png`
  let title = `<h3><img width=24 src="${url}"> ${panel.page.title}</h3>`
  let story = panel.page.story.map(item => render(item,panel)).join("\n")
  document.getElementById(panel.pid).innerHTML = title+story
}

function render(item, panel) {
  switch (item.type) {
    case 'paragraph':
      let resolved = item.text
        .replace(/\[\[(.+?)\]\]/g, internal)
        .replace(/\[(.+?) (.+?)\]/g, external)
      return `<p>${resolved}</p>`
  }
  return `<p style="background-color:#eee;">${item.type}</p>`

  function internal(link, title) {
    return `<a href="#" data-pid=${panel.pid}>${title}</a>`
  }

  function external(link, url, words) {
    return `<a href="${url}" target=_blank>${words}</a>`
  }
}

function click(event) {
  let target = event.target
  let pid = target.dataset.pid
  if (pid) {
    event.preventDefault()
    event.stopPropagation()
    let title = target.innerText
    console.log({target, title, pid})
    resolve(title, pid)
  }
}

async function resolve(title, pid) {
  const asSlug = (title) => title.replace(/\s/g, '-').replace(/[^A-Za-z0-9-]/g, '').toLowerCase()
  const recent = (list, action) => {if (action.site && !list.includes(action.site)) list.push(action.site); return list}
  let panel = lineup.find(panel => panel.pid == pid)
  let path = (panel.page.journal||[]).reverse().reduce(recent,[location.host, panel.site])
  console.log('resolve',{panel, path})
  let probs = path.map(where => probe(where, asSlug(title)))
  let pages = await Promise.all(probs)
  console.log({path, pages})
}

function probe(where, slug) {
  let site = where == 'view' ? location.host : where
  return fetch(`//${site}/${slug}.json`)
    .then(res => res.ok ? res.json() : null)
    .catch(err => null)
}
