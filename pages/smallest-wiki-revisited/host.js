// Serve requests from .wiki farms
// usage: dispatch(req)


import { serve } from "https://deno.land/std/http/server.ts";
export { dispatch }

async function dispatch (req) {
  let [path,query] = req.url.split('?')

  let headers = new Headers();
  headers.set('access-control-allow-origin','*')
  headers.set('content-type', 'application/javascript')


  switch (path) {
    case '':
    case '/':
      welcome(); break
    case '/favicon.png':
    case '/favicon.ico':
      favicon(); break
    case '/system/sitemap.json':
      sitemap(); break
    case '/view.js':
      module(); break
    default:
      variable()
  }

  function welcome() {
    let body = client()
    headers.set('content-type', 'text/html')
    req.respond({status:200, headers, body})
  }

  function favicon() {
    headers.set('content-type', 'image/png')
    Deno.readFile(`${req.wiki}/status/favicon.png`)
      .then(body => req.respond({status:200, headers, body}))
  }

  function sitemap() {
    Deno.readTextFile(`${req.wiki}/status/sitemap.json`)
      .then(body => req.respond({status:200, headers, body}))
  }

  function module() {
    headers.set('content-type', 'application/javascript')
    Deno.readTextFile(`.${path}`)
      .then(body => req.respond({status:200, headers, body}))
  }

  function variable() {
    let m
    if (m = path.match(/^\/([a-z-]+)\.json/)) {
      let file = `${req.wiki}/pages/${m[1]}`
      Deno.readTextFile(file)
        .then(body => req.respond({status:200, headers, body}))
        .catch(err => req.respond({status:404, headers, body:'not found'})  )
    } else {
      req.respond({status:400, headers, body:'bad request'})
    }
  }
}

function client() {
  return `<!doctype html>
  <html>
    <body>
      <style>
        body,html { width:100%; height:100%; }
        body {
          background: linear-gradient(45deg, #ddd 25%, transparent 80%) 0,0;
          background-size: 1em 1em;
          background-color: #eee; }
      </style>
      <script type=module>
        import { start } from "http://small.fed.wiki/assets/view.js"
        start()
      </script>
    </body>
  </html>`
}
