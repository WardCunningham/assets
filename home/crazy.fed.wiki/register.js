// example register.js module for crazy.fed.wiki demo

import * as fs from 'node:fs';
import * as path from 'node:path';

export function post(argv, data, done) {
  const email = data?.email || 'none'
  fs.appendFileSync(path.join(argv.status,'register.txt'), `${email}\n`);
  const emails = fs.readFileSync(path.join(argv.status,'register.txt'),'utf8') || ""
  const count = emails.trim().split(/\n/).length
  done(null,`${count} members in queue\n`)
}

export function get(argv, done) {
  const emails = fs.readFileSync(path.join(argv.status,'register.txt'),'utf8')
  done(null, emails||'none')
}