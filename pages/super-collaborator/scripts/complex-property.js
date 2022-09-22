// Attach a wiki page to the first Action in a graph
// Usage: deno run --allow-read --allow-net scripts/complex-property.js > Coding-Page.graph.json
import {Graph} from '../graph.js'
const code = await Graph.read('/Users/ward/Downloads/Coding.graph.json')
const page = await fetch('http://ward.asia.wiki.org/small-improvements.json').then(res=>res.json())
code.search('match (a:Action)')[0].a.props.target = page
console.log(code.stringify(null, 2))