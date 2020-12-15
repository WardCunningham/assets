// Serve requests from .wiki farms
// usage: dispatch(req)


import { serve } from "https://deno.land/std@0.79.0/http/server.ts";
export { dispatch }

async function dispatch (req) {
  let url = req.url
  let headers = new Headers();
  headers.set('access-control-allow-origin','*')

  switch (url) {
    case '':
    case '/':
      welcome(); break
    case '/favicon.png':
    case '/favicon.ico':
      favicon(); break
    case '/sitemap.json':
      sitemap(); break
    case '/view.js':
      module(); break
    default:
      variable()
  }

  function welcome() {
    console.log('welcome', url)
    let body = client()
    req.respond({status:200, headers, body})
  }

  function favicon() {
    headers.set('content-type', 'image/png')
    Deno.readFile(`${req.wiki}/status/favicon.png`)
      .then(body => req.respond({status: 200, headers, body}))
  }

  function sitemap() {
    console.log('sitemap', url)
    req.respond({status:404, headers, body:'sitemap'})
  }

  function module() {
    headers.set('content-type', 'application/javascript')
    Deno.readTextFile(`./view.js`)
      .then(body => req.respond({status: 200, headers, body}))
  }

  function variable() {
    let m
    if (m = url.match(/^\/([a-z-]+)\.json/)) {
      Deno.readTextFile(`${req.wiki}/pages/${m[1]}`)
        .then(body => req.respond({status: 200, headers, body}))
    } else {
      req.respond({status: 404, headers, body:'not found'})
    }
  }
}

function client() {
  return `<html>
    <body>
      <script type=module>
        import { start } from "./view.js"
        start()
      </script>
    </body>
  </html>`
}
