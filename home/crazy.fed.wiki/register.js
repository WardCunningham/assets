// sample register module for custom demo

import * as fs from 'node:fs';
import * as path from 'node:path';

export function post(data, done) {
  const status = '/Users/ward/.wiki/localhost/status'
  const dir = fs.readdirSync(status)
  console.log(dir)
  done(null, 'ok')
}