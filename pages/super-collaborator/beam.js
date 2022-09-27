import {Graph} from './graph.js'
import * as cypher from './cypher.js'
import {composite} from './composite.js'

export const croquet = {model:null, view:null}

const uniq = (value, index, self) => self.indexOf(value) === index
const emoji = await fetch('./emoji.txt')
  .then(res => res.text())
  .then(txt => txt.split(/\n/))

export class BeamModel extends Croquet.Model {

  init() {
    this.views = new Map();
    this.participants = 0;
    this.history = []; // { viewId, html } items
    this.beam = []; //{name, graph}
    this.lastPostTime = null;
    this.inactivity_timeout_ms = 60 * 1000 * 20; // constant
    this.subscribe(this.sessionId, "view-join", this.viewJoin);
    this.subscribe(this.sessionId, "view-exit", this.viewExit);
    this.subscribe("input", "newName", this.newName);
    this.subscribe("input", "newPost", this.newPost);
    this.subscribe("input", "reset", this.resetHistory);
    this.subscribe("input", "remove", this.removePoems);
    this.subscribe("input", "newPoems", this.addToBeam);
    this.subscribe("input", "updatePoem", this.updatePoem);
    croquet.model = this
  }

  static types() {
    return {
      "Graph": Graph
    };
  }

  viewJoin(viewId) {
    const existing = this.views.get(viewId);
    if (!existing) {
      const nickname = this.randomName();
      this.views.set(viewId, nickname);
    }
    this.participants++;
    this.publish("viewInfo", "refresh");
  }

  viewExit(viewId) {
    this.participants--;
    this.views.delete(viewId);
    this.publish("viewInfo", "refresh");
  }

  newName(opt) {
    this.views.set(opt.viewId, opt.nickname)
    this.publish("viewInfo", "refresh")
  }

  newPost(post) {
    const postingView = post.viewId;
    const nick = this.views.get(postingView);
    const chat = this.escape(post.chat);
    this.addToHistory({ viewId: postingView, nick, chat });
    this.lastPostTime = this.now();
    this.future(this.inactivity_timeout_ms).resetIfInactive();
  }

  updatePoem(opt) {
    const poem = this.beam[opt.index]
    const name = opt.graph.nodes[0].props.name || opt.graph.nodes[0].type || ''
    poem.name = name+opt.suffix
    poem.graph = opt.graph
    this.publish("beam", "refresh")
  }

  removePoems(indices) {
    for (const index of indices.reverse()) {
      this.beam.splice(index,1)
    }
    this.publish("beam", "refresh")
    window.beam.querySelectorAll('input').forEach(e => e.checked = false)
  }

  addToHistory(item){
    this.history.push(item);
    if (this.history.length > 100) this.history.shift();
    this.publish("history", "refresh");
  }

  addToBeam(poems) {
    this.beam.push(...poems)
    this.publish("beam", "refresh")
  }

  resetIfInactive() {
    if (this.lastPostTime !== this.now() - this.inactivity_timeout_ms) return;
    this.resetHistory("due to inactivity");
  }

  resetHistory(reason) {
    this.history = [{ nick:'system', chat: `reset ${reason}` }];
    if (reason == "at user request") this.beam = []
    this.lastPostTime = null;
    this.publish("history", "refresh");
    this.publish("beam", "refresh")
  }

  escape(text) { // Clean up text to remove html formatting characters
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
  }

  randomName() {
    return emoji[Math.floor(Math.random() * emoji.length)]
  }

}

BeamModel.register("BeamModel");

export class BeamView extends Croquet.View {

  constructor(model) {
    super(model);
    this.model = model;
    this.recall = []
    this.nextdownload = null
    textIn.addEventListener('keydown', (event) => {if(event.keyCode==38) {textIn.value = this.recall.pop()||''}})
    sendButton.onclick = () => {this.send(textIn.value); textIn.value = "";};
    this.subscribe("history", "refresh", this.refreshHistory);
    this.subscribe("viewInfo", "refresh", this.refreshViewInfo);
    this.subscribe("beam", "refresh", this.refreshBeam);
    this.refreshHistory();
    this.refreshViewInfo();
    this.refreshBeam()
    beam.addEventListener('keydown',this.narrowBeam)
    beam.addEventListener('keyup',this.narrowBeam)
    loginButton.addEventListener('click', event => this.newFace(this,event))

    if (model.participants === 1 &&
      !model.history.find(item => item.viewId === this.viewId)) {
      this.publish("input", "reset", "for new user");
    }
    const m = document.cookie.match(/\bface=(\d+)\b/)
    if (m) this.publish('input','newName',{viewId:this.viewId, nickname:emoji[+m[1]]})
    croquet.view = this
  }

  send(text) {
    if (text.startsWith('/')) this.recall.push(text)
    if (text === "/reset") {
      this.publish("input", "reset", "at user request");
    } else
    if (text === "/remove") {
      const indices = [...window.beamlist.querySelectorAll('input[type=checkbox]:checked')]
        .map(e => +e.value)
      window.target.innerHTML = ''
      this.publish("input", "remove", indices)
    } else
    if (text === "/download") {
      if (this.nextdownload) {
        download(...this.nextdownload)
      } else {
        const poems = [...window.beamlist.querySelectorAll('input[type=checkbox]:checked')]
          .map(e => this.beam()[+e.value])
        const poem = composite(poems)
        const filename = poems
          .map(poem => poem.name.replace(/[^a-zA-Z0-9]/g,''))
          .filter(uniq).sort().join('-') + '.graph.json'
        download(poem.graph.stringify(null,2),filename,'application/json')
      }
    } else
    if (text === "/schema") {
      const poems = [...window.beamlist.querySelectorAll('input[type=checkbox]:checked')]
        .map(e => this.beam()[+e.value])
      const nodes = []
      const rels = []
      const newnid = n => {
        let nid = nodes.findIndex(node => node.type === n.type)
        if (nid == -1) {
          nid = nodes.length
          nodes.push({type:n.type,in:[],out:[],props:{}})
        }
        for (const key of Object.keys(n.props)) {nodes[nid].props[key]=''}
        return nid
      }
      const newrid = (r,from,to) => {
        let rid = rels.findIndex(rel => rel.type === r.type)
        if (rid == -1) {
          rid = rels.length
          rels.push({type:r.type,from,to,props:{}})
        }
        for (const key of Object.keys(r.props)) {rels[rid].props[key]=''}
        return rid
      }
      for (const poem of poems) {
        for (const rel of poem.graph.rels) {
          const f = newnid(poem.graph.nodes[rel.from])
          const t = newnid(poem.graph.nodes[rel.to])
          const r = newrid(rel,f,t)
          nodes[f].out.push(r)
          nodes[t].in.push(r)
        }
      }
      this.nextdownload = [new Graph(nodes,rels).stringify(null,2),'target.schema.json', 'application/json']
      const tip = props => Object.entries(props).map(e => `${e[0]}: ${e[1]}`).join("\n")
      const dotn = nodes
        .map(node => `"${node.type}" [tooltip="${tip(node.props)}"]`)
      const dotr = rels
        .map(rel => `"${nodes[rel.from].type}" -> "${nodes[rel.to].type}" [label="${rel.type}" labeltooltip="${tip(rel.props)}"]`)
      const dot = ['node [shape=box style=filled fillcolor=palegreen]',...dotn, ...dotr]
      hpccWasm.graphviz.layout(`digraph {${dot.join("\n")}}`, "svg", "dot").then(svg => {
        target.innerHTML = svg;
      })
    } else
    if (text.startsWith("/match")) {
      const tree = cypher.parse(text.slice(1))
      if(!tree[0][0]) {
        return setTimeout(() => {window.textIn.value = `/${cypher.left}`},100)
      }
      const code = cypher.gen(0,tree[0][0],{})
      const inputs = [...window.beam.querySelectorAll('input[type=checkbox]')]
      this.model.beam.forEach((poem,i) => {
        inputs[i].checked = !!(cypher.apply(poem.graph,code).length)
      })
      window.dochoose({})
    }
    this.publish("input", "newPost", {viewId: this.viewId, nick:'system', chat:text});
  }

  newPoems(poems) {
    this.publish("input", "newPoems", poems)
  }

  updatePoem(index, graph, suffix) {
    this.publish("input", "updatePoem", {index,graph,suffix})
  }

  refreshViewInfo() {
    console.log('users', this.model.participants, 'at', new Date().toLocaleTimeString())
    members.innerText = [...this.model.views.values()].join(" ")
  }

  refreshHistory() {
    textOut.innerHTML = this.model.history
      .map(item => `${item.nick}: ${item.chat}`).join("<br>");
    textOut.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"})
  }

  refreshBeam() {
    this.nextdownload = null
    const want = [...window.beamlist.querySelectorAll('input[type=checkbox]:checked')]
      .map(e => +e.value)
    const names = this.model.beam.map(poem => poem.name || poem.graph.nodes[0].type)
    window.beamlist.innerHTML = names.map((n,i) =>
        `<div><font color=gray size=1>${i}</font>
        <input type=checkbox value=${i} id=n${i} ${want.includes(i)?'checked':''}>
        <label for=n${i}>${n}<sup>${this.model.beam[i].graph.nodes.length}</sup></label></div>`)
      .join("\n")
    const last = window.beamlist.querySelector('input:last-of-type')
    if(last) last.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"})
  }

  narrowBeam(event) {
    if(event.key === 'Shift') {
      const items = window.beamlist.querySelectorAll('input[type=checkbox]')
      const checked = window.beamlist.querySelectorAll('input[type=checkbox]:checked')
      if (event.type==='keydown' && checked.length) {
        items.forEach(item => {
          if(!item.checked && item.nextElementSibling.style.color != 'darkorange')
            item.parentElement.style.display='none'
        })
      } else {
        items.forEach(item => {
          item.parentElement.style.display='block'
        })
      }
    }
  }

  newFace(view, event) {
    const face = Math.floor(Math.random() * emoji.length)
    document.cookie = `face=${face};samesite`
    view.publish('input','newName',{viewId:this.viewId, nickname:emoji[face]})
  }

  beam() {
    return this.model.beam
  }
}

function download(string, file, mime='text/json') {
  var data = `data:${mime};charset=utf-8,` + encodeURIComponent(string)
  var anchor = document.createElement('a')
  anchor.setAttribute("href", data)
  anchor.setAttribute("download", file)
  document.body.appendChild(anchor) // required for firefox
  anchor.click()
  anchor.remove()
}
