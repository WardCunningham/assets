await fetch(`http://${Deno.args[0]||'nr.local'}:8000`).then(res => res.text())
setInterval(async () => {
  const t0 = Date.now()
  const t1 = await fetch(`http://${Deno.args[0]||'nr.local'}:8000`).then(res => res.text())
  const t2 = Date.now()
  const dt = t1-t0 - (t2-t0)
  console.log(`${t0},${dt}`)
},30000)
