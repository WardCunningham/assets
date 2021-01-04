import { reload, click, lineup } from './line.js'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
const prob = (pcnt) => Math.random()*100 < pcnt
const norm = (mean) => (Math.random()-Math.random()+1)*mean
const choose = (list) => {for (let one of list) if (prob(50)) return one; return null}

let origin = 'small.fed.wiki'
let hash = 'welcome-visitors/smallest-wiki-explained/radio-network-simulator@simnet.ward.asia.wiki.org/client-type-modules@ward.asia.wiki.org'
await reload(origin, hash)
panels()
// panes()
for (let i of [1,2,3,4,5,6,7,8,9]) {
  await monkey()  
}

async function monkey() {
  let panel = choose(lineup.slice().reverse())
  if(panel) {
    let links = panel.panes.map(pane=>pane.links)
    // console.log(links)
    let choice = choose(links.flat())
    if(choice) {
      console.log('click', panel.page.title, '=>', choice)
      await click(choice, panel.pid)
      panels() 
    }
  }
}


function panels() {
  console.table(lineup.map(panel=>({pid:panel.pid, dt:panel.dt, site:panel.site, slug:panel.slug})))
}

function panes() {
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