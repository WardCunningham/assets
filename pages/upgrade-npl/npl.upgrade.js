// Transform html image tags to new image plugin
// Usage:
//  cp -a npl.bay.localhost/ npl.asia.localhost
//  deno run --allow-read=npl.bay.localhost --allow-write=npl.asia.localhost npl.upgrade.js
//  rsync -a -v npl.asia.localhost/ root@asia.wiki.org:.wiki/npl.asia.wiki.org/

const bay = `./npl.bay.localhost`
const asia = `./npl.asia.localhost`
const pages = `${bay}/pages`
let updated
for await (const file of Deno.readDir(pages)) {

  // R E A D
  console.log("%c"+file.name, "color: red");
  const json = await Deno.readTextFile(`${pages}/${file.name}`)
  const page = JSON.parse(json)
  updated = false
  patch(page)

  // U P D A T E
  for (const item of page.story) {
    if (item.type=='image')
      image(item)
    else
      if (item.type=='html' && item.text.match(/<img/))
        if(item.text.match(/<table/))
          grid(item,page)
        else
          single(item)
      else
        continue
    journal(page)
    console.log('------------------------------------------')
  }

  // W R I T E
  if (updated) {
    const path = `${asia}/pages/${file.name}`
    page.story = page.story.flat()
    const json = JSON.stringify(page,null,2)
    await Deno.writeTextFile(path,json)
  }
  
}

function patch({title,story}) {
  if(title=='Pattern Cluster Diagram') {
    console.log("%cgraphviz","color:blue")
    const index = story.findIndex(item => item.type == 'graphviz')
    story[index].text = story[index].text.replace(/\^<table /,'^\\[\\[')
    console.log(story[index].text)
    updated = true
  }
}

function image(item) {
  console.log("%cimage","color:blue")
  console.log(item)
  item.url = item.url.replace(/http:/,'http://npl.wiki')
  updated = true
  console.log(item)
}

function single(item) {
  console.log("%csingle","color:blue")
  console.log(item.text)
  const [_,src] = item.text.match(/src="http:\/assets\/(.*?)"/)
  item.type = 'image'
  item.text = 'upload image'
  item.size = 'wide'
  item.width = 430
  item.url = `http://npl.wiki/assets/${src}`
  console.log(item)
  updated = true
}

function grid(item,page) {
  console.log("%cgrid","color:blue")
  console.log(item.text)
  const cells = [...item.text.matchAll(/src="http:\/assets\/(.*?)"><br>\n(.*?)</g)]
  const index = page.story.indexOf(item)
  page.story[index] = cells.map(cell => {
    const src = cell[1]
    const text = cell[2]
    return {
      type:'image',
      id: `${Math.floor(Math.random()*1000000000)}`,
      size:'thumbnail',
      text,
      width:183,
      height:230,
      url:`http://npl.wiki/assets/${src}`
    }
  })
  page.story[index].push({type:'pagefold',text:'.'})
  console.log(page.story[index])
  updated = true
}

function journal(page) {
  const create = JSON.parse(JSON.stringify(page))
  page.journal = [{
    type:'create',
    date:Date.now(),
    item:create
  }]
}


