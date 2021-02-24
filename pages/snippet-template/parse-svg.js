// Find coordinates of boxes in graphviz svg the hard way
// usage: cat basemap.svg | deno run parse-svg.js

let text = new TextDecoder().decode(await Deno.readAll(Deno.stdin))
let lines = text.split(/\n/)
let data = {}

svg()
console.log(data)

function svg() {
  while (lines.length) {
    if (lines[0].startsWith('<!--')) {
    } else if(lines[0].endsWith('-->')) {
    } else if(lines[0] == '') {
    } else if(lines[0].startsWith('<svg')) {
    } else if(lines[0].startsWith('</svg')) {
    } else if(lines[0].startsWith('<g id="graph')) {
      graph()
    } else {
      console.log(`can't make out svg '${lines[0]}'`)
    }
    lines.shift()
  }  
}

function graph() {
  lines.shift()
  while (!lines[0].startsWith('</g')) {
    if (lines[0].startsWith('<!--')) {
    } else if(lines[0].startsWith('<polygon')) {
    } else if(lines[0].startsWith('<g id="node')) {
      node()
    } else if(lines[0].startsWith('<g id="edge')) {
      edge()
    } else {
      console.log(`can't make out graph '${lines[0]}'`)
    }
    lines.shift()
  }
}

function node() {
  let name, place
  lines.shift()
  while (!lines[0].startsWith('</g')) {
    if (lines[0].startsWith('<!--')) {
    } else if(lines[0].startsWith('<polygon')) {
      place = polygon()
    } else if(lines[0].startsWith('<title')) {
      name = title()
    } else if(lines[0].startsWith('<text')) {
    } else if(lines[0].startsWith('</g')) {
    } else if(lines[0].startsWith('<path')) {
    } else {
      console.log(`can't make out node '${lines[0]}'`)
    }
    lines.shift()
  }
  data[name] = place
}

function edge() {
  lines.shift()
  while (!lines[0].startsWith('</g')) {
    if (lines[0].startsWith('<!--')) {
    } else if(lines[0].startsWith('<polygon')) {
    } else if(lines[0].startsWith('<title')) {
    } else if(lines[0].startsWith('<text')) {
    } else if(lines[0].startsWith('</g')) {
    } else if(lines[0].startsWith('<path')) {
    } else {
      console.log(`can't make out edge '${lines[0]}'`)
    }
    lines.shift()
  }
}

function title() {
  let m = lines[0].match(/<title>(.*?)<\/title>/)
  return m[1]
}

function polygon() {
  let m = lines[0].match(/points="(.*?)"/)
  return m[1]  
}
