import {stringify} from "https://deno.land/std@0.128.0/encoding/csv.ts";

// function quote(text) {
//   if(!/[,"\r\n]/.test(text)) return text
//   return `"${text.replace(/"/g,'""')}"`
// }
const quote = text => /[,"\r\n]/.test(text) ? `"${text.replace(/"/g,'""')}"` : text

let data = [
  ['Alpha','Beta'],
  [123.45, 'mega foo'],
  [645.66, 'mumbo, fumbo'],
  [7232.6, 'real "big" number'],
  [3.1415, 'mumbo, "small", number'],
  [404.56, `line one
line two`]
]

console.log(data)
console.log(data.map(row => row.map(quote).join(',')).join("\r\n"))
// console.log(await stringify(data))