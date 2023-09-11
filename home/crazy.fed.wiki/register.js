// sample register module for custom demo

import * as fs from 'node:fs';
import * as path from 'node:path';
const status = '/Users/ward/.wiki/localhost/status'

export function post(data, done) {
  const email = data?.email || 'none'
  fs.appendFileSync('./require.txt', `${email}\n`);
  const emails = fs.readFileSync('./require.txt') || ""
  const count = emails.trim().split(/\n/).length
  return `${count} members in queue\n`
}

export function get(done) {
  const emails = fs.readFileSync('./require.txt')
  return (emails||'none')
}