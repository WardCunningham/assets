// We wrap the Frame plugin's integrations with a promise-based interface and
// distribute them as an ES6 module along with a couple of helpers we've found useful.
// See http://code.fed.wiki/frame-integration-promises.html

export const asSlug = title => title.replace(/\s/g, '-').replace(/[^A-Za-z0-9-]/g, '').toLowerCase()
export const asCopy = obj => JSON.parse(JSON.stringify(obj))


// I N P U T

export function context() {
  return new Promise(resolve => {
    let handler = event => {
      let {data} = event
      if (!data.action == "frameContext") return
      window.removeEventListener('message',handler)
      resolve(data)
    }
    window.addEventListener('message',handler)
    window.parent.postMessage({action:"sendFrameContext"},"*")
  })
}

export function sources(topic) {
  const action = 'requestSourceData'
  return new Promise(resolve => {
    let fn = event => {
      let {data} = event
      if (!data.action == action) return
      window.removeEventListener('message', fn)
      resolve(data.sources)
    }
    window.addEventListener('message', fn)
    window.parent.postMessage({action, topic},"*")
  })
}

export async function assets() {
  let table = []
  let assets = await sources('assets')
  for (let source of assets){
    let site = source.panel.site
    let slug = source.panel.slug
    let item = source.panel.itemId
    for (let dir of Object.keys(source.assetsData)) {
      for (let path of Object.keys(source.assetsData[dir])) {
        for (let file of source.assetsData[dir][path]) {
          path = path.startsWith("//") ? path : `//${site}${path}`
          let url = `${path}/${dir}/${file}`
          let row = {site,slug,item,dir,path,file,url}
          table.push(row)
        }
      }
    }
  }
  return table
}

export function neighbors() {
  return new Promise((resolve, reject) => {
    window.addEventListener("message", neighborhood)
    function neighborhood({data}) {
      if (data.action != "neighborhood") return
      window.removeEventListener(
        "message", neighborhood)
      resolve(data.neighborhood)
    }
    window.parent.postMessage({
      action: "requestNeighborhood"
    }, "*") 
  })
}


// O U T P U T

export function link(title, keepLineup=false) {
  const msg = {action:"doInternalLink",keepLineup}
  if (typeof title === 'object')
    Object.assign(msg,title)
  else
    Object.assign(msg,{title})
  window.parent.postMessage(msg,"*")
}

export function open(page, keepLineup=false, forks=[]) {
  let date = Date.now()
  for (let item of page.story) item.id ||= (Math.random()*10**20).toFixed(0)
  page.journal ||= [{type:'create', date, item:asCopy(page)}, ...forks.map(site => ({type:'fork',date,site}))]
  let message = {action: "showResult", page, keepLineup}
  window.parent.postMessage(message, "*")
}

export function importer(pages, keepLineup=false, forks=[]) {
  let date = Date.now()
  for (let page of Object.values(pages)) {
    for (let item of page.story) item.id ||= (Math.random()*10**20).toFixed(0)
    page.journal ||= [{type:'create', date, item:asCopy(page)}, ...forks.map(site => ({type:'fork',date,site}))]
  }
  let message = {action: "importer", pages, keepLineup}
  window.parent.postMessage(message, "*")
}

export function download(string, file, mime='text/json') {
  var data = `data:${mime};charset=utf-8,` + encodeURIComponent(string)
  var anchor = document.createElement('a')
  anchor.setAttribute("href", data)
  anchor.setAttribute("download", file)
  document.body.appendChild(anchor) // required for firefox
  anchor.click()
  anchor.remove()
}
