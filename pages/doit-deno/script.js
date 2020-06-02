// Fetch each of a list of urls and display each side by side in a table
// Usage: deno run --allow-net script.js

import {doit} from 'http://ward.asia.wiki.org/assets/pages/doit-deno/doit.mjs'

doit (async (input) => {
  let urls = JSON.parse(input)
  let files = await Promise.all(urls.map(url => fetch(url).then(res => res.text())))
  return `<table><tr> ${files.map(file =>`<td><pre>${file}`).join('')} </table>`
})