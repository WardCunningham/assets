setInterval(async () => {
  const t0 = Date.now()
  const t1 = await fetch('http://3d.local:8000').then(res => res.text())
  const t2 = Date.now()
  console.log(t0,t1-t0,t2-t0)
},500)