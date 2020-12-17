// Manage the incremental viewing from one tab in the browser
// Usage: import { start } from "./view.js"; start()

export { start }

const newpid = () => Math.floor(Math.random()*1000000)
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
    <section>${section()}</section>
    <footer>${footer()}</footer>`
   body.addEventListener('click',click)
}

function section() {
  let hash = (location.hash||'view/welcome-visitors').replace(/(^[\/#]+)|(\/+$)/g,'')
  let fields = hash.split('/')
  let html = []
  while (fields.length) {
    let [where,slug] = fields.splice(0,2)
    let pid = newpid()
    html.push(`<article id=${pid}><h3>${slug}</h3></article>`)
    let url = where=='view' ? `./${slug}.json` : `//${where}/${slug}.json`
    let panel = {pid, where, slug, url}
    lineup.push(panel)
    fetch(url).then(res => res.json()).then(json => {panel.page = json; refresh(panel)})
  }
  return html.join("\n")
}

function footer() {
  return `<span>smallest wiki revisited</span>`
}


function update() {
  let section = document.getElementsByTagName('section')[0]
  section.innerHTML = lineup.map(panel => `<article id=${panel.pid}><h3>${panel.page.title}</h3></article>`).join("\n")
  for (let panel of lineup) {
    refresh(panel)
  }
}

async function refresh(panel) {
  let url = panel.where=='view' ? `./favicon.png` : `//${panel.where}/favicon.png`
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

async function click(event) {
  let target = event.target
  let pid = target.dataset.pid
  if (pid) {
    event.preventDefault()
    event.stopPropagation()
    let title = target.innerText
    let panel = await resolve(title, pid)
    let hit = lineup.findIndex(panel => panel.pid == pid)
    lineup.splice(hit+1,lineup.length, panel)
    update()
  }
}

async function resolve(title, pid) {
  const asSlug = (title) => title.replace(/\s/g, '-').replace(/[^A-Za-z0-9-]/g, '').toLowerCase()
  const recent = (list, action) => {if (action.site && !list.includes(action.site)) list.push(action.site); return list}
  let panel = lineup.find(panel => panel.pid == pid)
  let path = (panel.page.journal||[]).reverse().reduce(recent,[location.host, panel.where])
  console.log('resolve',{panel, path})
  let slug = asSlug(title)
  let pages = await Promise.all(path.map(where => probe(where, slug)))
  console.log({path, pages})
  let hit = pages.findIndex(page => page)
  if (hit >= 0) {
    return {pid:newpid(), where:path[hit], slug, page:pages[hit]}
  } else {
    let page = {title,story:[],journal:[]}
    return {pid:newpid(), where:'ghost', slug, page}
  }
}

function probe(where, slug) {
  let site = where == 'view' ? location.host : where
  return fetch(`//${site}/${slug}.json`)
    .then(res => res.ok ? res.json() : null)
    .catch(err => null)
}
