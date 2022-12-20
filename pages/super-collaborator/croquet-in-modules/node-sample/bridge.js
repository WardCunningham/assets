// const Croquet = ("@croquet/croquet");
// const fs = require('fs');

import Croquet from "@croquet/croquet"
import fs from "fs"

// Croquet model used client and server side.

import {Graph} from '../../graph.js'
import {createBeamModel} from './model.js'

const session = {}
const croquet = {}

const data = fs.readFileSync('../../emoji.txt',{encoding:'utf8', flag:'r'});
const emoji = data.split(/\n/)

const BeamModel = createBeamModel(emoji, Croquet)

BeamModel.register("BeamModel");

class BeamView extends Croquet.View {

  constructor(model) {
    super(model);
    this.model = model;
    this.subscribe("viewInfo", "refresh", this.refreshViewInfo);
    this.subscribe("beam", "refresh", this.refreshBeam);
  }  

  refreshBeam() {console.log('beam', this.model.beam)}
  refreshViewInfo() {console.log('users', this.model.participants, 'at', new Date().toLocaleTimeString())}
}


Croquet.Session.join({
  apiKey: '1MNinyGopbyxFzgx3HupBoCAryFb6yNOIihx6Omx9',
  appId: 'com.gmail.ward.cunningham.collaborator',
  name: "unnamed",
  password: "secret",
  step: "manual",
  model: BeamModel,
  view: BeamView
}).then(start => {
  Object.assign(session, start)
  console.log(start)
})

console.log(session)