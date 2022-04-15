let counter = {count: 0, last: 'nowhere'}
export function count(where) {
  counter.count += 1
  counter.last = where
  console.log(counter)
}