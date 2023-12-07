// example register.js module for crazy.fed.wiki demo

import * as fs from 'node:fs';
import * as path from 'node:path';

export function post(argv, data, done) {
  const email = data?.email || 'none'
  fs.appendFile(path.join(argv.status,'register.txt'), `${email}\n`, (err) => {
    if(err) return done(err)
    fs.readFile(path.join(argv.status,'register.txt'),'utf8',(err, text) => {
      if(err) return done(err)
      const count = text.trim().split(/\n/).length
      done(null,`${count} members in queue\n`)
    })
  })
}

export function get(argv, done) {
  fs.readFile(path.join(argv.status,'register.txt'),'utf8',(err, text) =>
    done(err, text||'none'))
}