let p = (1 + Math.sqrt(5)) / 2
let v = []

rect((a,b) => [0, a*1, b*p])
rect((a,b) => [a*1, b*p, 0])
rect((a,b) => [a*p, 0, b*1])

function rect(f) {
  v.push(f(+1,+1))
  v.push(f(-1,+1))
  v.push(f(+1,-1))
  v.push(f(-1,-1))
}

for (let i=0; i<12; i++)
  for (let j=0; j<i; j++)
    if (edge(i,j)) console.log([i,j])

function edge(i,j) {
  let sq = x => x*x
  let d = 
    sq(v[i][0]-v[j][0]) +
    sq(v[i][1]-v[j][1]) +
    sq(v[i][2]-v[j][2])
  return d == 4
}