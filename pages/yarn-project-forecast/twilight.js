// convert sunrise-sunset to minutes of daylight for each day of year
// deno run --allow-read twilight.js | pbcopy

const text = Deno.readTextFileSync('./twilight.txt')

const tab = text
  .split(/\n/)
  .filter(line => line.match(/^\d\d /))
  .map(line => line.match(/.{46}(.*)/)[1])
  .map(line => line.replaceAll(/.{11}/g,(s) => `${s}|`))
  .map(line => line.split(/\|/))

const months = [[],[],[],[],[],[],[],[],[],[],[],[]]
for(let m=0;m<12;m++) {
  for(let d=0;d<31;d++) {
    const field = tab[d][m]
    if(field.match(/\d/))
      months[m].push(field)}}

const year = months
  .flat()
  .map(day => day.replace(/..(\d\d)(\d\d).(\d\d)(\d\d)/,(_,h1,m1,h2,m2)=>(h2*60.0+ +m2)-(h1*60.0+ +m1)))
  .map(sec => +sec)

console.log(`const year=[${year}]`)