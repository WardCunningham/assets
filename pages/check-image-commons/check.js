// check image commons with site image assets
// cd .wiki; deno run --reload --allow-read http://ward.asia.wiki.org/assets/pages/check-image-commons/check.js

import {existsSync} from "https://deno.land/std/fs/exists.ts";
const images = entry => `${entry.name}/assets/plugins/image`
const uniq = (value, index, self) => self.indexOf(value) === index

const commons = [...Deno.readDirSync('commons')]
  .filter(entry => entry.isFile && !entry.name.startsWith('.'))
  .map(entry => entry.name)
const assets = [...Deno.readDirSync('.')]
  .filter(site => site.isDirectory && site.name != 'commons' && existsSync(images(site)))
  .map(site => [...Deno.readDirSync(images(site))]
    .filter(file => file.isFile && !file.name.startsWith('.'))
    .map(file => [file.name,site.name]))
  .flat()
const matches = [...commons, ...assets.map(tuple => tuple[0])]
  .filter(uniq)
  .map(name => [
    name,
    commons.findIndex(common => common == name),
    assets.filter(tuple => tuple[0] == name).map(tuple => tuple[1])])

console.table(matches)