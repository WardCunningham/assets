// select unactivated parks
// deno run --allow-read=parks.json select.js

// cat parks/* | jq -n '[inputs]' > parks.json

const parks = JSON.parse(Deno.readTextFileSync('./parks.json'))
const want = parks.filter(park => park && !park.firstActivator && ['Oregon','Washington'].includes(park.locationName))
const markup = want.map(park => `${park.latitude},${park.longitude} ${park.reference} ${park.name}`)
console.log(markup.join("\n"))