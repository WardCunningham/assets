let report = {}

scrape('introduction')

async function scrape(page) {
  let root = 'https://www.esrad.org.uk/resources/vsmg_3/screen.php?page='
  let text = await fetch(root+page).then(res => res.text())
  // await Deno.writeTextFile(`./pages/${page}.html`,text)
  let next = text.match(/<a class="navlink" href="screen.php\?page=(.+?)">next<\/a>/)[1]
  analyze(page, text)
  if (next != 'introduction')
    scrape(next)
  else
    console.table(report)
}

function analyze(page, text) {
  let tally = {}
  for (let match of text.matchAll(/<\/?(\w+).*?>/g)) {
    let tag = match[1]
    tally[tag] = tally[tag] || 0
    tally[tag] += 1
  }
  report[page] = tally
}