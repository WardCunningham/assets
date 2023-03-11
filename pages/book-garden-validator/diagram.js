// Generate dot for a book title in the style of Preview Next Diagram graphs
// Usage: deno run --allow-net diagram.js 'Markovian Moment' | pbcopy

const sitemap = await fetch('http://book.reimage.fed.wiki/system/sitemap.json').then(res => res.json())

const asSlug = (title) => title.replace(/\s/g, '-').replace(/[^A-Za-z0-9-]/g, '').toLowerCase()
const gettitle = slug => sitemap.find(info => info.slug == slug).title
const links = title => Object.keys((sitemap.find(info => info.slug == asSlug(title)).links||[]))
    .map(slug => gettitle(slug))
const backlinks = title => sitemap
    .filter(info => asSlug(title) in (info.links||{}))
    .map(info => info.title)
const quote = title => `"${title.replace(/ /g,'\\n')}"`

emit(`digraph {rankdir=LR`)
const here = Deno.args[0]

emit(`node [style=filled fillcolor=lightyellow penwidth=3 color=black fontname="Helvetica"]`)
emitnode(here)

emit(`node [style=filled fillcolor=white penwidth=3 color=black]`)
links(here).forEach(node => emitrel(here,node))

emit(`node [style=filled fillcolor=white penwidth=1 color=black]`)
links(here).forEach(here =>
  links(here).forEach(node => emitrel(here,node))
)

emit(`node [style="filled,rounded,dotted" fillcolor=white]`)
emit(`edge [style=dotted]`)
backlinks(here).forEach(node => emitrel(node,here))

emit(`}`)

function emit(str) {console.log(str)}
function emitnode(node) {console.log(quote(node))}
function emitrel(here,node) {console.log(`${quote(here)} -> ${quote(node)}`)}
