// convert sunrise-sunset to minutes of daylight for each day of year
// deno run --allow-read daylight.js | pbcopy

const text = Deno.readTextFileSync('./daylight.tsv')
const daylight = text
  .split(/\n/)
  .slice(1,-1)
  .map(line => line.split(/\t/))
  .map(cols => cols[3])
  .map(hms => hms.match(/(\d+)h (\d+)m (\d+)s/))
  .map(([_,h,m,s]) => h*60 + +m)
console.log(`const daylight=[${daylight}]`)