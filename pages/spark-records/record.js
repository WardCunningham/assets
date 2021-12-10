// record spark spots
// usage: mkdir data; deno run --allow-net --allow-write=data record.js nr.local

console.log(new Date())

let domain = Deno.args[0]||'localhost'
console.log({domain})
let socket = new WebSocket(`ws://${domain}:4649/Spark`)
socket.addEventListener('open', event => socket.send('{"cmd":"subscribeToSpots","Enable":true}'))
// socket.addEventListener('message', event => record(JSON.parse(event.data).spots))
socket.addEventListener('message',inspect)

let count = 0
function inspect(event) {
  try {
    count++
    if(count < 5) console.log(new Date(),count,event)
    let data = event.data
    let message = JSON.parse(data)
    let spots = message.spots
    let first = spots[0]
    let time = first.time
    record(spots)
  } catch (error) {
    console.error(new Date(),error)
  }
}

function record(spots) {
  let date = new Date(spots[0].time)
  let file = date.toISOString().slice(0,10)
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(spots)+"\n");
  Deno.writeFileSync(`data/${file}`, data, {append: true})
}