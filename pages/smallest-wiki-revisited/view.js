export { start }

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
}

function panels() {
  let hash = (location.hash||'view/welcome-visitors').replace(/(^[\/#]+)|(\/+$)/g,'')
  let fields = hash.split('/')
  let lineup = []
  while (fields.length) {
    let [site,slug] = fields.splice(0,2)
    let pid = Math.floor(Math.random()*1000000)
    lineup.push(`<article id=${pid}><h3>${slug}</h3></article>`)
    let url = site=='view' ? `./${slug}.json` : `//${site}/${slug}.json`
    console.log({site,slug,url})
    fetch(url).then(res => res.json()).then(json => refresh(pid,json))
  }
  return lineup.join("\n")
}

function footer() {
  return `<span>smallest wiki revisited</span>`
}

async function refresh(pid, page) {
  let panel = document.getElementById(pid)
  let title = `<h3>${page.title}</h3>`
  let story = page.story.map(render).join("\n")
  panel.innerHTML = title+story
}

function render(item) {
  switch (item.type) {
    case 'paragraph':
      let resolved = item.text
        .replace(/\[\[(.+?)\]\]/g, internal)
        .replace(/\[(.+?) (.+?)\]/g, external)
      return `<p>${resolved}</p>`
  }
  return `<p style="background-color:#eee;">${item.type}</p>`
}

function internal(link, title) {
  return `<a href="${'#'}.json">${title}</a>`
}

function external(link, url, words) {
  return `<a href="${'#'}.json">${words}</a>`
}