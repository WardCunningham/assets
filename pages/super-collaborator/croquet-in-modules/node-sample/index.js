const Croquet = require("@croquet/croquet");

class MyModel extends Croquet.Model {

    init() {
        this.counter = 0;
        this.future(1000).tick();
    }

    tick() {
        this.counter++;
        this.publish("counter", "update");
        this.future(1000).tick();
    }

}
MyModel.register("MyModel");

const name = process.argv[2] || "noname";
const password = process.argv[3] || "nopassword";

Croquet.Session.join({
    apiKey: "1MNinyGopbyxFzgx3HupBoCAryFb6yNOIihx6Omx9",
    appId: "io.croquet.hello",
    name,
    password,
    model: MyModel,
    step: "manual",
}).then(({ step, model, view }) => {
    setInterval(step, 100);
    view.subscribe("counter", "update", () => console.log(model.counter));
});