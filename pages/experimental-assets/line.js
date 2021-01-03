const newpid = () => Math.floor(Math.random()*1000000)
const purl = (site, slug) => site ? `http://${site}/${slug}.json` : `http://${'small.fed.wiki'}/${slug}.json`

let lineup = []
let types = {}
let t0 = Date.now()

let hash = 'welcome-visitors/smallest-wiki-explained/how-to-wiki@fed.wiki.org/client-type-modules@ward.asia.wiki.org'
await reload(hash)
console.log(hash)
report()

function reload(hash) {
  let fields = hash.replace(/(^[/#]+)|([/]+$)/g,'').split('/')
  let flight = []
  for (let field of fields) {
    let [slug,site] = field.split('@')
    let pid = newpid()
    let panel = {pid, site, slug}
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
    let handler = await types[item.type]
    if (handler === undefined) {
      let url = `http://small.fed.wiki/assets/types/wiki-client-type-${item.type}.js`
      try {
        let handler = import(url).catch(err=>{console.log('import',err)})
        types[item.type] = handler
      } catch (err) {
        console.log('import fails', url)
        types[item.type] = false
      }
      handler = await types[item.type]
    }
    if (handler) {
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

function linkmark() {
  return `<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAC0WlDQ1BJQ0MgUHJvZmlsZQAAKJGNlM9LFGEYx7+zjRgoQWBme4ihQ0ioTBZlROWuv9i0bVl/lBLE7Oy7u5Ozs9PM7JoiEV46ZtE9Kg8e+gM8eOiUl8LALALpblFEgpeS7Xlnxt0R7ccLM/N5nx/f53nf4X2BGlkxTT0kAXnDsZJ9Uen66JhU+xEhHEEdwqhTVNuMJBIDoMFjsWtsvofAvyute/v/OurStpoHhP1A6Eea2Sqw7xfZC1lqBBC5XsOEYzrE9zhbnv0x55TH8659KNlFvEh8QDUtHv+auEPNKWmgRiRuyQZiUgHO60XV7+cgPfXMGB6k73Hq6S6ze3wWZtJKdz9xG/HnNOvu4ZrE8xmtN0bcTM9axuod9lg4oTmxIY9DI4YeH/C5yUjFr/qaoulEk9v6dmmwZ9t+S7mcIA4TJ8cL/TymkXI7p3JD1zwW9KlcV9znd1Yxyeseo5g5U3f/F/UWeoVR6GDQYNDbgIQk+hBFK0xYKCBDHo0iNLIyN8YitjG+Z6SORIAl8q9TzrqbcxtFyuZZI4jGMdNSUZDkD/JXeVV+Ks/JX2bDxeaqZ8a6qanLD76TLq+8ret7/Z48fZXqRsirI0vWfGVNdqDTQHcZYzZcVeI12P34ZmCVLFCpFSlXadytVHJ9Nr0jgWp/2j2KXZpebKrWWhUXbqzUL03v2KvCrlWxyqp2zqtxwXwmHhVPijGxQzwHSbwkdooXxW6anRcHKhnDpKJhwlWyoVCWgUnymjv+mRcL76y5o6GPGczSVImf/4RVyGg6CxzRf7j/c/B7xaOxIvDCBg6frto2ku4dIjQuV23OFeDCN7oP3lZtzXQeDj0BFs6oRavkSwvCG4pmdxw+6SqYk5aWzTlSuyyflSJ0JTEpZqhtLZKi65LrsiWL2cwqsXQb7Mypdk+lnnal5lO5vEHnr/YRsPWwXP75rFzeek49rAEv9d/AvP1FThgxSQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAKtJREFUGJVtkLERwjAMRZ+5UHmmNNpCrpMloMi5gCXcO1MkLWwBS6SCO1EQgkP4d2q+nr50cmZGqbZt18YsV4IxRqv2FcfD8XeYXWl0Xefutzsxxk1iFUJYrfLeU9f1BtwB5JzJOeO9R1UREcZxXCVX5R0l1Pc9AKfz6ZsIoKpcrpcFmqaJlJJ7Pp6klByqah8Nw2BN05iZ2ezzqWU1gIggIv/e+AZDCH+bpV442lpGxygDswAAAABJRU5ErkJggg==" alt="" />`
}

function report() {
  console.table(lineup.map(panel=>({pid:panel.pid, dt:panel.dt, site:panel.site, slug:panel.slug})))
  for (let panel of lineup) {
    console.log(panel.page.title)
    console.table(panel.panes.map(pane=>({
      id:pane.id,
      dt:pane.dt,
      type:pane.type,
      look:(pane.look||'').replace(/<.*?>/g,'').slice(0,40),
      links:pane.links})))
}
}