// fix records with unescaped newlines
// deno run --allow-read=. fixjson.js | jq . > records.json

const lines = Deno.readTextFileSync('./records.txt').split(/\n/)
while (lines.length) {
  let line = lines.shift()
  if (line.startsWith('"bio"')) {
    while(!line.endsWith('",')) {
      line += ' ' + lines.shift()
    }
    console.error(line)
  }
  console.log(line)
}