// Format trace of fox-sim calc for all functs
// Usage: deno run fox.trace.js

import * as sim from './fox-sim.js'
for (const key of sim.keys()) {
  const trace = sim.trace(key)[0]
  if (trace[1].startsWith('(')){
    let [keyt,code,evel,value] = trace
    console.log()
    console.log(`__${keyt}__`)
    code = code.replaceAll('() => ','')
    code = code.replaceAll('()','')
    code = code.replaceAll('p.','')
    // console.log('  ',code)
    for (const binding of evel) {
      if (!binding[2].length) {
        code = code.replace(binding[0],`${binding[3]}`)
      }
    }
    console.log('  = ', code)
    console.log('  = ', value)
  }
}