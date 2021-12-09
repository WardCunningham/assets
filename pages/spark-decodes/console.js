// Listen to SparkSDR and report payloads heard.
// usage: deno run --allow-net console.js frequency msg

// {
//   "cmd": "spotResponse",
//   "spots": [
//     {
//       "time": "2021-06-29T21:14:00Z",
//       "frequency": 14076666,
//       "tunedfrequency": 14074303,
//       "power": 0,
//       "drift": 0,
//       "snr": 11,
//       "dt": 0.2,
//       "msg": "CQ K7REK CN85",
//       "mode": "FT8",
//       "distance": 22.8393423022036,
//       "call": "K7REK",
//       "color": 1,
//       "locator": "CN85",
//       "valid": true,
//       "offsetFrequency": 2363,
//       "rxid": 1
//     }, ...


const socket = new WebSocket('ws://nr.local:4649/Spark')

socket.addEventListener('open', event =>
  socket.send('{"cmd":"subscribeToSpots","Enable":true}')
)

socket.addEventListener('message', event => {
  let payload = JSON.parse(event.data)
  let spots = payload.spots ?? []
  for (let spot of spots) {
    let columns = Deno.args.map( field => spot[field] )
    console.log(columns.join("\t"))
  }
  let d = new Date()
  let s = new Date(spots[0].time)
  console.log('Δt', (d.getTime() - s.getTime())/1000, 'sec')
})
