// https://en.wikipedia.org/wiki/Bearing_(navigation)
// https://en.wikipedia.org/wiki/Octant_(plane_geometry)
// http://www.csgnetwork.com/degreelenllavcalc.html

// http://trails.ward.asia.wiki.org/tuning-the-rose.html

let lab = 'n,ne,e,se,s,sw,w,nw'.split(',')
let tab = []

for (let ber=0; ber<360; ber+=(45)) {

  // test lat/lon in a circle radius one mile
  let north =+(Math.sin((90-ber)*Math.PI/180)/69.05).toFixed(6)
  let east = +(Math.cos((90-ber)*Math.PI/180)/-48.99).toFixed(6)

  // compute planar geometry with math conventions
  let dy = north*69.05
  let dx = east*-48.99
  let angle = Math.atan2(dy,dx)

  // into clockwise bering
  let bering = (90-angle*180/Math.PI+360)%360

  // round to nearest octant
  let oct = Math.round(bering/45)%8
  let dir = lab[oct]
  tab.push({ber,north,east,dy,dx,angle,bering,oct,dir})
}
console.table(tab)

// 45.4714296, -122.7462316 [[Hideaway Park]]
let lat = 45.4714296
let lon = -122.7462316
let div = 1000
console.log(tab.map(r => `${(lat+r.north).toFixed(6)}, ${(lon-r.east).toFixed(6)} ${r.ber} ⇒ ${r.dir}`).join("\n"))