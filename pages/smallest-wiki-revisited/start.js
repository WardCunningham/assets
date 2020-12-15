// Configure and run a federated wiki server
// usage: deno run --allow-net --allow-read start.js


import { serve } from "https://deno.land/std@0.79.0/http/server.ts";
import * as host from "./host.js"

let server = serve({ port: 4444 });
for await (let req of server) {
  let [domain, port] = (req.headers.get('host')||'localhost').split(':')
  req.wiki = "/Users/ward/.wiki/"+domain
  console.log(new Date().toLocaleString(), domain, req.url)
  host.dispatch(req)
}