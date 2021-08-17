// read a recent search log and inspect active sites for installed plugin version
// usage: deno run --allow-net read-logs.js

  import { Sha1 } from "https://deno.land/std/hash/sha1.ts"
  const rev = domain => domain.split(/\./).reverse()
  const done = ['46.101.23.193']


// Find the most recent search scrape log

  let endpoint = `http://search.fed.wiki.org:3030/logs`
  let logs = await fetch(endpoint).then(res => res.text())
  let latest = logs.split(/\n/)[0].replace(/<.*?>/g,'')
  console.log({latest})


// Read sites exposing sitemaps, sort them by domain name sufix

  let log = await fetch(`http://search.fed.wiki.org:3030/logs/${latest}.txt`).then(res => res.text())
  log = log.split(/\n/)
  log = log.filter(line => / pages$/.test(line))
  log = log.map(line => line.match(/^(.*?), (\d+) pages$/).splice(1))
  log.sort((a,b) => rev(a[0]).join('.').localeCompare (rev(b[0]).join('.')))
  log.shift()
  // console.log({log})


// Aggregate sites with same suffix assuming they are farms

  let table = []
  let last = null
  let count = null
  let total = null
  let all = null
  for (let [site, pages] of log) {
    let here = rev(site).slice(0,2).reverse().join('.')
    if (here != last) {
      if (last) table.push([last, count, total, all])
      last = here
      count = 1
      total = +pages
      all = [site]
    }
    else {
      count += 1
      total += +pages
      all.push(site)
    }
  }


// Lookup ip address for each aggregate

  for (let row of table) {
    let addrs = dns(row[0])
    row.push(addrs)
  }


// Ignore addresses considered "done"

  table = table.filter(row => !(row[4].length == 1 && done.includes(row[4][0])))


// Fetch plugin info for each aggregate

  let t0 = Date.now()
  async function examine(rows) {
    let site = rows[3][0]
    if (rows[4].length) {
      let plugin = await fetch(`http://${site}/plugins/frame/frame.js`).then(res => res.ok ? res.text() : res.status)
      rows.push(plugin.toString().length > 5 ? new Sha1().update(plugin.toString()).toString().slice(0,8) : plugin)      
    } else {
      // rows.push(null)
    }
    console.log(Date.now()-t0, site, rows[5])
    return true
  }

  await Promise.all(table.map(row => examine(row)))


// Report most fields with headings

  let summary = table.map(row => {
    let [site, sites, pages, list, addrs, plugin] = row;
    return {site, sites, pages, addrs, plugin}})
  console.table(summary)






  function dns(domain) {
    const host =
`feast.fm has address 104.198.14.52
distributed.academy has address 104.21.44.78
freedombone.net has address 147.148.109.2
npl.wiki has address 159.203.254.26
txtzyme.com has address 159.203.254.26
xpdx.org has address 159.203.254.26
andysylvester.com has address 162.241.224.128
shll.wiki has address 162.255.119.240
randombits.xyz has address 167.99.167.162
distributed.academy has address 172.67.197.78
rodwell.me has address 178.62.99.190
sound.garden has address 184.72.19.87
fed.wiki has address 188.166.198.19
mmelcher.org has address 192.241.132.143
nrn.io has address 198.211.103.94
openlearning.cc has address 199.16.128.113
coevolving.com has address 199.16.128.7
mcmorgan.org has address 208.113.174.155
chrisellis.me has address 217.8.252.179
hashbase.io has address 35.193.163.202
frankmcpherson.net has address 35.222.145.77
bovill.me has address 46.101.23.193
bullshido.academy has address 46.101.23.193
c0de.academy has address 46.101.23.193
commons.world has address 46.101.23.193
conversation.live has address 46.101.23.193
conversation.wiki has address 46.101.23.193
cryptoacademy.org has address 46.101.23.193
daisy.world has address 46.101.23.193
dark.science has address 46.101.23.193
democracy.garden has address 46.101.23.193
emotional.wiki has address 46.101.23.193
exponentiallyhuman.org has address 46.101.23.193
federation.life has address 46.101.23.193
fedwiki.org has address 46.101.23.193
festivaljam.org has address 46.101.23.193
festivaljam.xyz has address 46.101.23.193
festivalofmint.org has address 46.101.23.193
form.world has address 46.101.23.193
future.football has address 46.101.23.193
future.science has address 46.101.23.193
futureperfect.world has address 46.101.23.193
goaljam.org has address 46.101.23.193
greendeal.wiki has address 46.101.23.193
hood.wiki has address 46.101.23.193
husbands.me has address 46.101.23.193
ksenya.me has address 46.101.23.193
lexon.wiki has address 46.101.23.193
liquiddemocracy.org has address 46.101.23.193
liquidlaw.org has address 46.101.23.193
lisp.studio has address 46.101.23.193
literate.wiki has address 46.101.23.193
livecode.world has address 46.101.23.193
mediagarden.org has address 46.101.23.193
memebase.cc has address 46.101.23.193
obeya.xyz has address 46.101.23.193
offersandwants.me has address 46.101.23.193
offersandwants.org has address 46.101.23.193
oneworld.wiki has address 46.101.23.193
outlandish.academy has address 46.101.23.193
parliamentofthings.org has address 46.101.23.193
pattern.club has address 46.101.23.193
peoplepowered.money has address 46.101.23.193
permanent.wiki has address 46.101.23.193
plantoid.cc has address 46.101.23.193
pod.club has address 46.101.23.193
powerofsix.org has address 46.101.23.193
progressive.earth has address 46.101.23.193
proto.institute has address 46.101.23.193
regovern.earth has address 46.101.23.193
regovern.org has address 46.101.23.193
spacenet.work has address 46.101.23.193
thought.garden has address 46.101.23.193
visualjam.org has address 46.101.23.193
vox.money has address 46.101.23.193
voz.money has address 46.101.23.193
voz.network has address 46.101.23.193
wikimentary.tv has address 46.101.23.193
worldcitizen.institute has address 46.101.23.193
worldscape.fm has address 46.101.23.193
vincentvanderlubbe.com has address 50.87.249.11
sound.garden has address 52.52.138.60
glitch.me has address 54.192.73.18
glitch.me has address 54.192.73.22
glitch.me has address 54.192.73.5
glitch.me has address 54.192.73.58
innovateoregon.org has address 68.66.216.59
uwiki.me has address 69.163.153.4
c2.com has address 69.168.54.22
wiki.org has address 69.168.54.22
commoning.wiki has address 88.99.144.132
federated.wiki has address 88.99.144.132`
  return host.split(/\n/).filter(line => line.startsWith(domain)).map(line => line.split(/ has address /)[1])
}

