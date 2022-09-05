import {Graph} from 'https://wardcunningham.github.io/graph/graph.js'

export const croquet = {model:null, view:null}

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
    this.subscribe("input", "newPost", this.newPost);
    this.subscribe("input", "reset", this.resetHistory);
    this.subscribe("input", "newPoems", this.newPoems);
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

  newPost(post) {
    const postingView = post.viewId;
    const nick = this.views.get(postingView);
    const chat = this.escape(post.chat);
    this.addToHistory({ viewId: postingView, nick, chat });
    this.lastPostTime = this.now();
    this.future(this.inactivity_timeout_ms).resetIfInactive();
  }

  newPoems(poems) {
    this.addToBeam(poems)
  }

  updatePoem(opt) {
    const poem = this.beam[opt.index]
    const name = opt.graph.nodes[0].props.name || ''
    poem.name = name+opt.suffix
    poem.graph = opt.graph
    this.publish("beam", "refresh")
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
    return (Math.random()*1000000).toFixed(0)
  }

}

BeamModel.register("BeamModel");

export class BeamView extends Croquet.View {

  constructor(model) {
    super(model);
    this.model = model;
    sendButton.onclick = () => {this.send(textIn.value); textIn.value = "";};
    this.subscribe("history", "refresh", this.refreshHistory);
    this.subscribe("viewInfo", "refresh", this.refreshViewInfo);
    this.subscribe("beam", "refresh", this.refreshBeam);
    this.refreshHistory();
    this.refreshViewInfo();
    this.refreshBeam()

    if (model.participants === 1 &&
      !model.history.find(item => item.viewId === this.viewId)) {
      this.publish("input", "reset", "for new user");
    }
    croquet.view = this
  }

  send(text) {
    if (text === "/reset") {
      this.publish("input", "reset", "at user request");
    } else {
      this.publish("input", "newPost", {viewId: this.viewId, nick:'system', chat:text});
    }
  }

  newPoems(poems) {
    this.publish("input", "newPoems", poems)
  }

  updatePoem(index, graph, suffix) {
    this.publish("input", "updatePoem", {index,graph,suffix})
  }

  refreshViewInfo() {
    console.log('users', this.model.participants)
  }

  refreshHistory() {
    textOut.innerHTML = this.model.history
      .map(item => `${item.nick}: ${item.chat}`).join("<br>");
    sendButton.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"})
  }

  refreshBeam() {
    const want = [...window.beam.querySelectorAll('input[type=checkbox]:checked')]
      .map(e => +e.value)
    const names = this.model.beam.map(poem => poem.name)
    window.beam.innerHTML = names.map((n,i) =>
        `<input type=checkbox value=${i} ${want.includes(i)?'checked':''}>${n}`)
      .join("<br>")
    const last = window.beam.querySelector('input:last-of-type')
    if(last) last.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"})
  }

  beam() {
    return this.model.beam
  }
}
