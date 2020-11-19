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

const socket = new WebSocket('ws://localhost:4649/Spark')
const handle = (event) => console.log(`handle ${event.type} at ${new Date().toLocaleTimeString()}`)

socket.addEventListener('open', (event) => {
  handle(event)
  socket.send('{"cmd":"subscribeToSpots","Enable":true}')
})

socket.addEventListener('message', handle)
socket.addEventListener('error', handle)
socket.addEventListener('close', handle)
