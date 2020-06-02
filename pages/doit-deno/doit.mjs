// Modularize the Client-Server Doit Framework
// Usage: import {doit} from 'http://ward.asia.wiki.org/assets/pages/doit-deno/doit.mjs'; doit(async i => f(i))

let html = `
<style>
  body {
    font-family: "Helvetica Neue", Verdana, helvetica, Arial, Sans;
    background: #eeeeee url("https://eu.wiki.org/images/crosses.png");
    max-width: 640px;
    margin: 30;
  }
  td {
    vertical-align: top;
  }
  pre {
    background: white;
    margin:15px;
    padding:15px;
  }
</style>
<pre id="readz" contenteditable="true"></pre>
<div> <button id="evalz">Doit</button>
<div id="printz"></div>
<script>

  // Save input between reloads
  let path = location.pathname
  if (localStorage[path])
    readz.innerText = localStorage[path]
  readz.addEventListener('focusout', e => {
    localStorage[path] = readz.innerText
  })

  // Read, eval and print
  evalz.onclick = e => {
    printz.innerHTML = '<i>running</i>'
    let headers = {
      'Accept': 'text/html',
      'Content-Type': 'application/json'
    }
    let body = readz.innerText
    fetch(path,{method:'POST',headers,body})
      .then(res=>res.text())
      .then(txt=>{printz.innerHTML = txt})
  }

</script>`

import {serve} from "https://deno.land/std/http/server.ts"
export {doit}

async function doit (f) {

  async function evaluate(req) {
    let buf = await Deno.readAll(req.body)
    let txt = new TextDecoder("utf-8").decode(buf)
    return f(txt)
  }

  const port = 7070
  const server = serve({port})
  for await (const req of server) {
    if(req.method == 'POST') {
      req.respond({body: await evaluate(req)})
    } else {
      req.respond({body: html})
    }
  } 
}

