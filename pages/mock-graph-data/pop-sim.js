// duplicate vensim population model
// usage: deno run flow-sim.js

const lifetime = 9;
const birthrate = 0.125;
const step = 0.125;
const stop = 30;

const state = {year:0, pop:1000};
const output = [];

while (state.year <= stop) {
  const births = state.pop * birthrate;
  const deaths = state.pop / lifetime;
  output.push({year:state.year, births, deaths, pop:state.pop});
  state.year += step;
  state.pop += births-deaths;
}

output.forEach(row =>
  Object.keys(row).map(key =>
    row[key] = Math.floor(row[key])));

console.table(output);