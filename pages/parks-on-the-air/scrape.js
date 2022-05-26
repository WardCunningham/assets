// scrape us parks from pota site
// usage: deno run --allow-net --allow-write=parks scrape.js > miss

// .from({length: 8000}, (x, i) => [i+1000,Math.random()])

const todo = Array
  .from({length: 685}, (x, i) => [i+9000,Math.random()])
  .sort((a,b) => a[1]-b[1])
  .map(a => a[0])

while (todo.length) {
  const code = todo.shift()
  try {
    const park = await fetch(`https://api.pota.app/park/K-${code}`).then(res => res.text())
    Deno.writeTextFileSync(`./parks/${code}`,park)
  } catch (e) {
    console.log(code)
    console.error('code',code,'error',e)
  }
}