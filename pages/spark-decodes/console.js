// Listen to SparkSDR and report payloads heard.
// usage: deno run --allow-net console.js

// call: "N0PUI"
// color: 0
// distance: null
// drift: 0
// dt: 0.2
// frequency: 1280
// locator: "EN34"
// mode: "FT8"
// msg: "E72X N0PUI EN34"
// power: 0
// snr: -17
// time: "2020-11-14T04:43:45Z"
// tunedfrequency: 3573000
// valid: true

import { delay } from 'https://deno.land/x/delay@v0.2.0/mod.ts';

const socket = new WebSocket('ws://localhost:4649/Spark')

socket.addEventListener('open', (event) => {
  console.log('open', event)
  socket.send('{"cmd":"subscribeToSpots","Enable":true}')
})

socket.addEventListener('message', (event) => {
  let msg = JSON.parse(event.data)
  console.table(msg.spots)
})

while(true) {
  await delay(15000)
  console.log('')
}