export { reload, click, lineup }

let origin = 'localhost'

const newpid = () => Math.floor(Math.random()*1000000)
const newpanel = (props) => ({pid:newpid(), stats:{}, ...props})
const purl = (site, slug) => site ? `http://${site}/${slug}.json` : `http://${origin}/${slug}.json`

let lineup = []
let types = {}
let t0 = Date.now()

function reload(org, hash) {
  origin = org
  let fields = hash.replace(/(^[/#]+)|([/]+$)/g,'').split('/')
  let flight = []
  for (let field of fields) {
    let [slug,site] = field.split('@')
    let panel = newpanel({site, slug, where:site})
    lineup.push(panel)
    flight.push(fetch(purl(site,slug)).then(res => res.json()).then(json => {panel.page = json; refresh(panel)}))
  }
  return Promise.all(flight)
}

function refresh(panel) {
  let flight = []
  panel.dt = Date.now() - t0
  panel.panes = []
  for (let item of panel.page.story) {
    let id = item.id
    let type = item.type
    let pane = {id, type, item, links:[]}
    panel.panes.push(pane)
    flight.push(render(pane,panel))
  }
  return Promise.all(flight)
}

function dynaload(type) {
  let url = `http://small.fed.wiki/assets/types/wiki-client-type-${type}.js`
  return import(url).catch(err=>({emit:() => `<p>troubled ${type}</p>`}))
}

async function render(pane,panel) {
  let item = pane.item
  switch (item.type) {
  case 'paragraph':
    let resolved = item.text
      .replace(/\[\[(.+?)\]\]/g, internal)
      .replace(/\[(.+?) (.+?)\]/g, external)
    pane.dt = Date.now() - t0
    return pane.look = `<p>${resolved}</p>`
  default:
    let handler = types[item.type] || await dynaload(item.type)
    if (handler) {
      types[item.type] = handler
      pane.look = handler.emit(null, item)
      pane.dt = Date.now() - t0
    }
  }
  return `<p style="background-color:#eee;">${item.type}</p>`

  function internal(link, title) {
    pane.links.push(title)
    return `<a href="#" data-pid=${panel.pid}>${title}</a>`
  }

  function external(link, url, words) {
    return `<a href="${url}" target=_blank>${words} ${linkmark()}</a>`
  }
}

async function click(title, pid) {
  let start = Date.now()
  let panel = await resolve(title, pid)
  panel.stats.fetch = Date.now() - start
  let hit = lineup.findIndex(panel => panel.pid == pid)
  lineup.splice(hit+1,lineup.length, panel)
  start = Date.now()
  return refresh(panel).then(() => {panel.stats.refresh = Date.now() - start})
}

async function resolve(title, pid) {
  const asSlug = (title) => title.replace(/\s/g, '-').replace(/[^A-Za-z0-9-]/g, '').toLowerCase()
  const recent = (list, action) => {if (action.site && !list.includes(action.site)) list.push(action.site); return list}
  let panel = lineup.find(panel => panel.pid == pid)
  let path = (panel.page.journal||[]).reverse().reduce(recent,[origin, panel.where])
  // console.log('resolve',{panel, path})
  let slug = asSlug(title)
  let pages = await Promise.all(path.map(where => probe(where, slug)))
  // console.log({path, pages})
  let hit = pages.findIndex(page => page)
  if (hit >= 0) {
    return newpanel({where:path[hit], slug, page:pages[hit]})
  } else {
    let page = {title,story:[],journal:[]}
    return newpanel({where:'ghost', slug, page})
  }
}

function probe(where, slug) {
  let site = where == null ? origin : where
  return fetch(`http://${site}/${slug}.json`)
    .then(res => res.ok ? res.json() : null)
    .catch(err => null)
}

function linkmark() {
  return `<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAC0WlDQ1BJQ0MgUHJvZmlsZQAAKJGNlM9LFGEYx7+zjRgoQWBme4ihQ0ioTBZlROWuv9i0bVl/lBLE7Oy7u5Ozs9PM7JoiEV46ZtE9Kg8e+gM8eOiUl8LALALpblFEgpeS7Xlnxt0R7ccLM/N5nx/f53nf4X2BGlkxTT0kAXnDsZJ9Uen66JhU+xEhHEEdwqhTVNuMJBIDoMFjsWtsvofAvyute/v/OurStpoHhP1A6Eea2Sqw7xfZC1lqBBC5XsOEYzrE9zhbnv0x55TH8659KNlFvEh8QDUtHv+auEPNKWmgRiRuyQZiUgHO60XV7+cgPfXMGB6k73Hq6S6ze3wWZtJKdz9xG/HnNOvu4ZrE8xmtN0bcTM9axuod9lg4oTmxIY9DI4YeH/C5yUjFr/qaoulEk9v6dmmwZ9t+S7mcIA4TJ8cL/TymkXI7p3JD1zwW9KlcV9znd1Yxyeseo5g5U3f/F/UWeoVR6GDQYNDbgIQk+hBFK0xYKCBDHo0iNLIyN8YitjG+Z6SORIAl8q9TzrqbcxtFyuZZI4jGMdNSUZDkD/JXeVV+Ks/JX2bDxeaqZ8a6qanLD76TLq+8ret7/Z48fZXqRsirI0vWfGVNdqDTQHcZYzZcVeI12P34ZmCVLFCpFSlXadytVHJ9Nr0jgWp/2j2KXZpebKrWWhUXbqzUL03v2KvCrlWxyqp2zqtxwXwmHhVPijGxQzwHSbwkdooXxW6anRcHKhnDpKJhwlWyoVCWgUnymjv+mRcL76y5o6GPGczSVImf/4RVyGg6CxzRf7j/c/B7xaOxIvDCBg6frto2ku4dIjQuV23OFeDCN7oP3lZtzXQeDj0BFs6oRavkSwvCG4pmdxw+6SqYk5aWzTlSuyyflSJ0JTEpZqhtLZKi65LrsiWL2cwqsXQb7Mypdk+lnnal5lO5vEHnr/YRsPWwXP75rFzeek49rAEv9d/AvP1FThgxSQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAKtJREFUGJVtkLERwjAMRZ+5UHmmNNpCrpMloMi5gCXcO1MkLWwBS6SCO1EQgkP4d2q+nr50cmZGqbZt18YsV4IxRqv2FcfD8XeYXWl0Xefutzsxxk1iFUJYrfLeU9f1BtwB5JzJOeO9R1UREcZxXCVX5R0l1Pc9AKfz6ZsIoKpcrpcFmqaJlJJ7Pp6klByqah8Nw2BN05iZ2ezzqWU1gIggIv/e+AZDCH+bpV442lpGxygDswAAAABJRU5ErkJggg==" alt="" />`
}