// duplicate vensim population model
// usage: import {rate,state,step} from './pop-sim.js'

export const rate = {lifetime:8, birthrate:0.125, timestep:0.125}
export const state = {year:0, pop:1000}

export function step() {
  const births = state.pop * (rate.birthrate * rate.timestep)
  const deaths = state.pop / (rate.lifetime * rate.timestep)
  state.year += rate.timestep
  state.pop += births-deaths
}
