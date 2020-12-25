// Serve requests from .wiki farms
// usage: dispatch(req)


import { serve } from "https://deno.land/std@0.79.0/http/server.ts";
export { dispatch }

async function dispatch (req) {
  let [path,query] = req.url.split('?')

  let headers = new Headers();
  headers.set('access-control-allow-origin','*')

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
    req.respond({status:200, headers, body})
  }

  function favicon() {
    headers.set('content-type', 'image/png')
    Deno.readFile(`${req.wiki}/status/favicon.png`)
      .then(body => req.respond({status:200, headers, body}))
  }

  function sitemap() {
    req.respond({status:404, headers, body:'no sitemap'})
  }

  function module() {
    headers.set('content-type', 'application/javascript')
    Deno.readTextFile(`./view.js`)
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
  return `<html>
    <body>
      <script type=module>
        import { start } from "http://small.fed.wiki/assets/view.js"
        start()
      </script>
    </body>
  </html>`
}
