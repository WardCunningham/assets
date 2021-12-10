// record spark spots
// usage: mkdir data; deno run --allow-net --allow-write=data record.js nr.local

let domain = Deno.args[0]||'localhost'
console.log({domain})
let socket = new WebSocket(`ws://${domain}:4649/Spark`)
socket.addEventListener('open', event => socket.send('{"cmd":"subscribeToSpots","Enable":true}'))
socket.addEventListener('message', event => record(JSON.parse(event.data).spots))

function record(spots) {
  let date = new Date(spots[0].time)
  let file = date.toISOString().slice(0,10)
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(spots)+"\n");
  Deno.writeFileSync(`data/${file}`, data, {append: true})
}