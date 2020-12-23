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
    log('work', name)
    await webserver(choose(['search', 'browse', 'update', 'select', 'details', 'purchase', 'checkout']))
    await delay(norm(name.length*100))
  }
}

async function webserver(query) {
  log('webserver', query)
  await database(prob(80) ? 'read' : 'write')
  await delay(norm(query.length*100))
}

async function database(op) {
  log('database', op)
  await delay(norm(op.length*100))
}

async function source(vendor) {
  for (let i = 0; i<1000; i++) {
    log('deliver', vendor)
    await backend(choose(['crate','box','bag']))
    await delay(norm(vendor.length*100))
  }
}

async function backend(delivery) {
  log('backend', delivery)
  await database(Math.random()<0.8 ? 'read' : 'write')
  await delay(Math.random()*delivery.length*100)    
}
