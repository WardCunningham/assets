// read a recent search log and inspect active sites for installed plugin version
// usage: deno run --allow-net --unstable read-logs.js

  import { Sha1 } from "https://deno.land/std/hash/sha1.ts"
  const rev = domain => domain.split(/\./).reverse()
  const done = ['46.101.23.193', '159.203.254.26', '188.166.198.19', '46.101.237.224']


// Find the most recent search scrape log

  let endpoint = `http://search.fed.wiki.org:3030/logs`
  let logs = await fetch(endpoint).then(res => res.text())
  let latest = logs.split(/\n/)[0].replace(/<.*?>/g,'')


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

  let t = Date.now()
  await Promise.all(table.map(dns))

  async function dns(row) {
    let name = row[3][0].split(/:/)[0]
    let addrs = await Deno.resolveDns(name,"A")
    console.log(Date.now()-t, {name,addrs})
    row.push(addrs)
  }


// Ignore addresses considered "done"

  table = table.filter(row => !(row[4]?.length == 1 && done.includes(row[4][0])))


// Record sha1 hash for each version

// plugin=frame
// curl -s http://asia.wiki.org/plugin/plugmatic/view/$plugin |\
// jq -r '.versions[]' |\
// while read v; do
//   npm i wiki-plugin-$plugin@$v
//   sum=`sha1sum node_modules/wiki-plugin-$plugin/client/$plugin.js`
//   echo \[\"$v\",\"$sum\"\],
// done | pbcopy

  let versions = [
    ['0.8.7','368c07f096c73a15454e4dd6a3bdf7d3723a5f23'],
    ['0.8.6','add9b2be8510a85c3f51db25ec0b4c143dbdf3cb'],
    ['0.8.5','f6225e5a1cbcb3b5ec26cf90d2eb9d5fd8f3e1bd'],
    ['0.8.4','e6ba4da85d2b3b98d4204d6df9abcefcbeec6836'],
    ['0.8.3','9c74300e0605f38e7a6be008be195a102d228f5a'],
    ['0.8.2','b9f13652a43a0c2e3aada81c44ca44fcaac090ba'],
    ['0.8.1','d2f61161fa875181ee5837bcf3b2cdd4c3b7d5b9'],
    ['0.8.0','37d0594e7c1da8d3cd1871d53ad17ac323e44e71'],
    ['0.7.0','a7a5cffecddf8ecdb71a1dc058e80f2435dad6a9'],
    ['0.3.0','2670896e64aef6945d9afe5eb6f2dd976372c13d'],
    ['0.2.2','50d1dbdd26801837d42000703cfbc3193c53378e'],
    ['0.2.0','b4283e1e19a6f616bd3598671bdfe79bd19afdeb'],
    ['0.1.3','ca8a991c3d09faf2187ab178f638b3fc08fe46f9'],
    ['0.1.2','ca8a991c3d09faf2187ab178f638b3fc08fe46f9'],
    ['0.1.1','ca8a991c3d09faf2187ab178f638b3fc08fe46f9']
  ]


// Fetch plugin info for each aggregate

  let t0 = Date.now()
  async function examine(rows) {
    let site = rows[3][0]
    if (rows[4].length) {
      let plugin = await fetch(`http://${site}/plugins/frame/frame.js`).then(res => res.ok ? res.text() : res.status)
      if (plugin.toString().length < 5) {
        rows.push(plugin)
      } else {
        let sha1 = new Sha1().update(plugin.toString()).toString()
        let vers = versions.find(vers => vers[1] == sha1) || [sha1.slice(0,11)]
        rows.push(vers[0])
      }
    } else {
      // rows.push(null)
    }
    console.log(Date.now()-t0, site, rows[5])
    return true
  }

  await Promise.all(table.map(row => examine(row)))


// Report most fields with headings

  console.log({latest})
  let summary = table.map(row => {
    let [site, sites, pages, list, addrs, plugin] = row;
    return {site, sites, pages, plugin, addrs}})
  summary.sort((a,b) => a.addrs[0].localeCompare(b.addrs[0]))
  console.table(summary)
