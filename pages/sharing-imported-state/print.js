import {count} from './stats.js'
export function simple() {
  count('simple')
}
export function complex(delegate) {
  count('complex')
  delegate()
}