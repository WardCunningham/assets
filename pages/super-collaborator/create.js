import {Graph} from 'https://wardcunningham.github.io/graph/graph.js'

const delay = msec => new Promise(done => setTimeout(done, msec))
const uniq = (value, index, self) => self.indexOf(value) === index
const dup = obj => JSON.parse(JSON.stringify(obj))


const schema = await Graph.fetch('./action.schema.json')

export function create(result, creating) {

  let s = schema
  let g = null

  let stride = {}
  let lineup = []

  stride.new = {
    render: div => {
      let keys = Object.keys(s.tally().nodes)
      div.innerHTML = `<p>
        <input type="button" value=done style="float:right;" disabled>
        ${keys.map(type =>
        `<span>${type}</span>`).join("<br>")}</p>`
    },
    click: event => {
      let target = event.target
      if(target.tagName=='SPAN') {
        bold(target)
        let line = event.target.closest("[data-line]").dataset.line
        let name = target.innerText
        let model = s.n(name).map(node => node)[0]
        g = new Graph()
        let nid = g.addNode(model.type,dup(model.props))
        let props = g.nodes[nid].props
        lineup[line].div.querySelector('input').disabled = false
        creating.start(g)
        drill(line, stride.fill, {nid,props})
      } else if (target.innerText="done") {
        creating.finish(g)
        g = null
        drill(-1,stride.new, {})
      }
    }
  }

  stride.fill = {
    render: div => {
      let line = div.dataset.line
      let entries = Object.entries(lineup[line].data.props)
      div.innerHTML = `<hr><p>${entries.map(entry =>
        `<span>${entry[0]}</span><br><input type=text value="${entry[1]}" size=50 style="width:100%;">`).join("<br>")}</p><button>+</button> <button>⧎</button>`
    },
    click: event => {
      let target = event.target
      if(target.tagName != 'BUTTON') return
      let line = target.closest("[data-line]").dataset.line
      let nid = lineup[line].data.nid
      if (target.innerText == '+')
        drill(line, stride.add, {})
      else
        drill(line, stride.link, {nid})
    },
    input: event => {
      let target = event.target
      let line = target.closest("[data-line]").dataset.line
      let props = lineup[line].data.props
      let key = target.previousSibling.previousSibling.innerText
      props[key] = target.value.trim()
    }
  }

  stride.add = {
    render: div => {
      let line = div.dataset.line
      div.innerHTML = `<hr><p><input type=text size=50 placeholder="new property name"></p>`
    },
    input: event => {
      if (event.type != 'change') return
      let target = event.target
      let line = target.closest("[data-line]").dataset.line
      let key = target.value.replace(/\W/g,'').toLowerCase()
      let data = lineup[line-1].data
      if(key) data.props[key] = ''
      drill(line-2, stride.fill, data)
    }
  }

  stride.link = {
    render: div => {
      let line = div.dataset.line
      let nid = lineup[line].data.nid
      let node = g.nodes[nid]
      let name = node.props['name'] || 'This'
      let here = s.n(node.type).map(node => node)[0]
      let i = here.in.map(rid => `<span>${s.nodes[s.rels[rid].from].type} ${s.rels[rid].type} ▷</span> ${name}`)
      let o = here.out.map(rid => `${name} <span>▷ ${s.rels[rid].type} ${s.nodes[s.rels[rid].to].type}</span>`)
      // console.log({nid, i, o})
      div.innerHTML = `<hr><p>${[...o, ...i].join("<br>")}</p>`
    },
    click: event => {
      const newNode = type => {
        let model = s.n(type).map(node => node)[0]
        return g.addNode(model.type,dup(model.props))
      }
      let target = event.target
      if(target.tagName=='SPAN') {
        bold(event.target)
        let line = event.target.closest("[data-line]").dataset.line
        let nid = lineup[line].data.nid
        let seq = target.innerText.split(/ +/)
        let tid
        if(seq[0] == '▷') {
          tid = newNode(seq.pop())
          g.addRel(seq.pop(),nid,tid,{})
        }
        else {
          seq.reverse()
          tid = newNode(seq.pop())
          g.addRel(seq.pop(),tid,nid,{})
        }
        let props = g.nodes[tid].props
        drill(line, stride.fill, {nid:tid,props})
      }
    }
  }


  async function drill(line,step,data) {
    while (lineup.length-1 > line) lineup.pop().div.remove()
    await delay(300)
    let div = document.createElement('div')
    lineup.push({step,data,div})
    div.setAttribute('data-line',lineup.length-1)
    div.addEventListener('click', step.click)
    div.addEventListener('input', step.input)
    div.addEventListener('change', step.input)
    step.render(div)
    result.append(div)
    div.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"})
    if(g) creating.update(g)
    // window.parent.postMessage({action: "resize",height: document.body.offsetHeight}, "*")
  }

  drill(-1,stride.new, {})

  function bold(target) {
    target.closest('p').querySelectorAll('span').forEach(span =>
      span.style.cssText = 'font-weight:400')
    target.style.cssText = 'font-weight:900'
  }

}

