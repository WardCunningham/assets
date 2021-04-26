import { reload, click, lineup } from './line.js'
import * as Colors from 'https://deno.land/std/fmt/colors.ts'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
const prob = (pcnt) => Math.random()*100 < pcnt
const norm = (mean) => (Math.random()-Math.random()+1)*mean
const choose = (list) => {for (let one of list) if (prob(50)) return one; return null}

let origin = 'small.fed.wiki'
let hash = 'first-functional-test'
let todo = []
await reload(origin, hash)
panels()
panes(9)

queue(lineup.slice(-1)[0].page)

while(todo.length) {
  let next = todo.shift()
  console.log(next)
  let m
  if (m = next.match(/^► see (\d+) panels?$/)) {
    confirm(lineup.length == m[1])
  } else if (m = next.match(/^► see (\w+) plugin?$/)) {
    confirm(true)
  } else if (m = next.match(/^► show lineup?$/)) {
    panels()
  } else if (m = next.match(/^► drop ([a-z-]+)@([a-zA-Z0-9\.]+)$/)) {
    confirm(false)
  } else {
    console.log(Colors.yellow("unknown"))
  }
}

function queue(page) {
  for (let item of page.story) {
    for (let line of item.text.split(/\n/)) {
      if (line.match(/^►/)) {
        todo.push(line)
      }
    }
  }
}

function confirm(boolean) {
  console.log(boolean ? Colors.green('succeeds') : Colors.red('fails'))
}



// for (let i=0; i<20; i++) {
//   await monkey()
// }

async function monkey() {
  let panel = choose(lineup.slice().reverse())
  if(panel) {
    // console.log('monkey panel',panel)
    let links = panel.panes.map(pane=>pane.links)
    // console.log(links)
    let choice = choose(links.flat())
    if(choice) {
      console.log('click', panel.page.title, '=>', choice)
      await click(choice, panel.pid)
      panes(1)
      panels()
    }
  }
}

function panels() {
  console.table(lineup.map(panel=>({pid:panel.pid, dt:panel.dt, site:panel.site, slug:panel.slug, where:panel.where})))
}

function panes(n) {
  for (let panel of lineup.slice(-n)) {
    console.log(panel.page.title)
    console.table(panel.panes.map(pane=>({
      id:pane.id,
      dt:pane.dt,
      type:pane.type,
      look:(pane.look||'').replace(/<.*?>/g,'').slice(0,40),
      links:pane.links})))
  }
}