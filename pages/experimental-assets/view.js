// Manage the incremental viewing from one tab in the browser
// Usage: import { start } from "./view.js"; start()

import { reload, click, lineup } from './line.js'
export { start }

function start () {
  let body = document.getElementsByTagName('body')[0]
  body.innerHTML += `
    <style>
      body {font-family: Arial, Helvetica, sans-serif;
        display:flex; flex-direction:column;
        margin:0; padding:0; width:100%; height:100%; overflow:hidden;}
      section {flex: 1; display: flex; flex-direction: row;
        overflow: scroll; scrollbar-width: none;}
      article {flex: 0 0 400px; position: relative;
        background-color: white; margin: 8px; box-shadow: 2px 1px 4px rgba(0, 0, 0, 0.2);}
      .paper {padding: 8px; overflow-y: auto; overflow-x: hidden;
        top: 0; bottom: 0; left: 0; right: 0; position: absolute;}
      footer {background-color:#ccc; padding:10px;
        flex-basis:20px;}
    </style>
    <section>${section()}</section>
    <footer>${footer()}</footer>`
   body.addEventListener('click',doclick)
}

function section() {
  let hash = (location.hash||'welcome-visitors').replace(/(^[\/#]+)|(\/+$)/g,'')
  reload(location.host,hash).then(update)
  return ''
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
  let url = `//${panel.where||location.host}/favicon.png`
  let title = `<h3><img width=24 src="${url}"> ${panel.page.title}</h3>`
  let looks = panel.panes.map(pane => pane.look)
  let debug = `<p><button data-pid=${panel.pid}>debug</button></p>`
  document.getElementById(panel.pid).innerHTML = `<div class=paper>${title}${looks.join("\n")}${debug}</div>`
}

async function doclick(event) {
  let target = event.target
  let pid = target.dataset.pid
  if (pid) {
    event.preventDefault()
    event.stopPropagation()
    let title = target.innerText
    if (title=='debug') return showpanel(target, pid)
    await click(title,pid)
    update()
  }
}

function showpanel(target, pid) {
  let panel = lineup.find(panel => panel.pid == pid)
  target.outerHTML = `<pre>${JSON.stringify(panel,null,2).replace(/&/g,'&amp;').replace(/</g,'&lt;')}</pre>`
}

