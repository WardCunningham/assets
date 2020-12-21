// https://en.wikipedia.org/wiki/Bearing_(navigation)
// https://en.wikipedia.org/wiki/Octant_(plane_geometry)

let tab = []
let lab = 'n,ne,e,se,s,sw,w,nw'.split(',')
for (let ber=0; ber<=360; ber+=5) {
  let east = Math.round(Math.sin(ber*Math.PI/180)*100)
  let north = Math.round(Math.cos(ber*Math.PI/180)*100)
  let angle = Math.round(180*Math.atan2(east,north)/Math.PI)
  let oct = Math.floor((angle+360+45/2)/45%8)
  let dir = lab[oct]
  tab.push({ber,east,north,angle,oct,dir})
}
console.table(tab)