// run the count example as a wiki foreign federated server
// deno run --allow-net --location=http://c2.com wikicount.js

import Croquet from "../croquet.js";

const countDisplay = {}

class MyModel extends Croquet.Model {

    init() {
        this.count = 0;
        this.subscribe("counter", "reset", this.resetCounter);
        this.future(1000).tick();
    }

    resetCounter() {
        this.count = 0;
        this.publish("counter", "changed");
    }

    tick() {
        this.count++;
        this.publish("counter", "changed");
        this.future(1000).tick();
    }

}


class MyView extends Croquet.View {

    constructor(model) {
        super(model);
        this.model = model;
        countDisplay.onclick = event => this.counterReset();
        this.subscribe("counter", "changed", this.counterChanged);
        this.counterChanged();
    }

    counterReset() {
        this.publish("counter", "reset");
    }

    counterChanged() {
        countDisplay.textContent = this.model.count;
    }

}

MyModel.register("MyModel");

Croquet.Session.join({
    appId: "io.codepen.croquet.hello",
    apiKey: "1_9oolgb5b5wc5kju39lx8brrrhm82log9xvdn34uq",
    name: "unnamed",
    password: "secret",
    model: MyModel,
    view: MyView
});
