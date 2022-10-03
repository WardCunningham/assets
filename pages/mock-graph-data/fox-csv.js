// Simulate -- Calculate every value by name for every step

import * as sim from './fox-sim.js'

const keys = sim.keys().sort()
console.log(keys.map(k=>`"${k.replaceAll("_"," ")}"`).join(","))
const start = sim.calc('initial_time')
const stop = sim.calc('final_time')
const step = sim.calc('time_step')
for (let time=start; time<=stop; time+=step) {
  console.log(keys.map(k=>sim.calc(k)).join(","))
  sim.step()
}
