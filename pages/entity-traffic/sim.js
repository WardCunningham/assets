export { start }

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
let log = (thing, details) => console.log(thing, details)

const prob = (pcnt) => Math.random()*100 < pcnt
const norm = (mean) => (Math.random()-Math.random()+1)*mean
const choose = (list) => {for (let one of list) if (prob(50)) return one; return '500 error'}

function start(logger) {
  if(logger) log = logger
  for (let name of ['Joshua', 'Beth', 'Ward', 'Eric']) person(name)
  for (let vendor of ['amazon', 'apple', 'shopify']) source(vendor)
}

async function person(name) {
  for (let i = 0; i<1000; i++) {
    // log("user", person, 'work')
    await webserver(choose(['search', 'browse', 'update', 'select', 'details', 'purchase', 'checkout']), 'user')
    await delay(norm(name.length*100))
  }
}

async function webserver(query, from) {
  log('webserver', query, from)
  await balancer((prob(80) ? 'read' : 'write'), 'webserver')
  await delay(norm(query.length*100))
}

async function balancer(op, from) {
  log('balancer', op, from)
  return await database(op, 'balancer')
}

async function database(op, from) {
  log('database', op, from)
  await delay(norm(op.length*100))
}

async function source(vendor) {
  for (let i = 0; i<1000; i++) {
    // log('deliver', vendor, 'vender')
    await backend(choose(['crate','box','bag']),vendor)
    await delay(norm(vendor.length*100))
  }
}

async function backend(delivery, from) {
  log('backend', delivery, from)
  await balancer((Math.random()<0.8 ? 'read' : 'write'), 'backend')
  await delay(Math.random()*delivery.length*100)    
}
