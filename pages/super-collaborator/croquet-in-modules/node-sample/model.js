// Croquet model used client and server side.

import {Graph} from '../../graph.js'

export function createBeamModel (emoji, Croquet) {
return class BeamModel extends Croquet.Model {

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
    // croquet.model = this
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
}

