// read a recent search log and inspect active sites for installed plugin version
// usage: deno run --allow-net --unstable read-logs.js

  import { Sha1 } from "https://deno.land/std/hash/sha1.ts"
  const rev = domain => domain.split(/\./).reverse()


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

  let ipcounts = {}
  let ipcount = ip => { ipcounts[ip] ||= 0; ipcounts[ip]+= 1; return ipcounts[ip] }
  table = table.filter(row => ipcount(row[4][0]) <= 5)


// Record sha1 hash for each version

// plugin=present
// curl -s http://asia.wiki.org/plugin/plugmatic/view/$plugin |\
// jq -r '.versions[]' |\
// while read v; do
//   npm i wiki-plugin-$plugin@$v
//   sum=`sha1sum node_modules/wiki-plugin-$plugin/client/$plugin.js`
//   echo \[\"$v\",\"$sum\"\],
// done | pbcopy

  let versions = [
    ["0.1.0","9249d473bc1fb943d817b04552d26537c53274b5"],
    ["0.1.1","98fcf5c787047a7b9467011302e03d876cec62fa"],
    ["0.1.2","26a573ebcdf68934e4dc09996844aa4bbd2eb205"],
    ["0.1.3","2fb74603c48bd07d7295575559bb5a896959c085"],
    ["0.1.4","2f208eb6d8c108a4d9157d3024cdaa8e90c52d5a"],
    ["0.1.5","8e1d0d18b5eb4620698ead6b578bcf4f09dd6bac"],
    ["0.1.6","a9c3b601a7939f41a2d91976e041015f45d55c45"],
    ["0.1.7","cc61cf34b11526a8057e087a693def5427b33ecb"],
    ["1.0.0","a9bc1665651a85bbeb752d3540930ec6db30f715"],
    ["1.1.0","892304c0e55e662d02ea63513b3ac0fd0a14180d"]
  ]


// Fetch plugin info for each aggregate

  let t0 = Date.now()
  async function examine(rows) {
    let site = rows[3][0]
    if (rows[4].length) {
      let plugin = await fetch(`http://${site}/plugins/present/present.js`).then(res => res.ok ? res.text() : res.status)
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
