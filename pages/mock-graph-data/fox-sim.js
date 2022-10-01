// Evaluate a Vensim model that is known to oscillate
// Continuation of dynamic modeling work
// http://ward.dojo.fed.wiki/view/stock-and-flow/view/stock-and-flow-simulator/view/rabbit-breeding

const p = {}
const q = {}
const states = {}

// (01) FINAL TIME= 100
// Units: Time
// The final time for the simulation.

q.final_time = 100

// (02) Fractional predation rate=
// Reference predation rate*(Predators Y/Reference predators)
// Units: fraction/Time
// Fractional rate of decrease in prey from predation; equal to 
// (beta*y) in the wiki article.

q.fractional_predation_rate = () => p.reference_predation_rate() * (p.predators_y() / p.reference_predators())

// (03) INITIAL TIME= 0
// Units: Time
// The initial time for the simulation.

q.initial_time = 0

// (04) Predation rate per predator beta=
// Reference predation rate/Reference predators
// Units: fraction/Time/pred
// Prey predation parameter; beta in the wiki article

q.predation_rate_per_predator_beta = () => p.reference_predation_rate()/p.reference_predators()

// (05) Predator decrease rate=
// Predators Y*Predator fractional decrease rate gamma
// Units: pred/Time
// Natural rate of decrease of predators from mortality and 
// emmigration.

q.predator_decrease_rate = () => p.predators_y() * p.predator_fractional_decrease_rate_gamma()

// (06) Predator fractional decrease rate gamma=
// 0.1
// Units: fraction/Time [0,1]

q.predator_fractional_decrease_rate_gamma = 0.1

// (07) Predator fractional growth rate=
// Reference predator growth rate*(Prey X/Reference prey)
// Units: fraction/Time
// Fractional rate of increase of predators; equal to (delta*x) in 
// the wiki article.

q.predator_fractional_growth_rate = () => p.reference_predator_growth_rate() * (p.prey_x()/p.reference_prey())

// (08) Predator growth per prey delta=
// Reference predator growth rate/Reference prey
// Units: fraction/Time/Prey
// Predator growth parameter; delta in the wiki article

q.predator_growth_per_prey_delta = () => p.reference_predator_growth_rate() / p.reference_prey()

// (09) Predator increase rate=
// Predators Y*Predator fractional growth rate
// Units: pred/Time

q.predator_increase_rate = () => p.predators_y() * p.predator_fractional_growth_rate()

// (10) Predators Y= INTEG (
// Predator increase rate-Predator decrease rate,
// Relative initial predators*Reference predators)
// Units: pred

q.predators_y = () => integrate(() => p.predator_increase_rate() - p.predator_decrease_rate(), p.relative_initial_predators() * p.reference_predators())

// (11) Prey decrease rate=
// Prey X*Fractional predation rate
// Units: Prey/Time
// Rate of decrease in prey from predation

q.prey_decrease_rate = () => p.prey_x() * p.fractional_predation_rate()

// (12) Prey fractional growth rate alpha=
// 0.3
// Units: fraction/Time [0,1]
// Fractional growth rate of prey per unit time, absent predation

q.prey_fractional_growth_rate_alpha = 0.3

// (13) Prey increase rate=
// Prey fractional growth rate alpha*Prey X
// Units: Prey/Time
// Rate of increase in prey (e.g., births of elk or rabbits); prey 
// are assumed to have unlimited food supply and therefore to 
// increase exponentially in the absence of predation.

q.prey_increase_rate = () => p.prey_fractional_growth_rate_alpha() * p.prey_x()

// (14) Prey X= INTEG (
// Prey increase rate-Prey decrease rate,
// Relative initial prey*Reference prey)
// Units: Prey

q.prey_x = () => integrate(() => p.prey_increase_rate() - p.prey_decrease_rate(), p.relative_initial_prey() * p.reference_prey())

// (15) Reference predation rate=
// 0.1
// Units: fraction/Time [0,1]

q.reference_predation_rate = 0.1

// (16) Reference predator growth rate=
// 0.2
// Units: fraction/Time [0,1]

q.reference_predator_growth_rate = 0.2

// (17) Reference predators=
// 10
// Units: pred [0,?]

q.reference_predators = 10

// (18) Reference prey=
// 100
// Units: Prey [0,?]

q.reference_prey = 100

// (19) Relative initial predators=
// 1
// Units: Dmnl [0,?]
// Initial predators, relative to the reference value

q.relative_initial_predators = 1

// (20) Relative initial prey=
// 1
// Units: Dmnl [0,?]
// Initial prey, relative to the reference value

q.relative_initial_prey = 1

// (21) SAVEPER= 
//        TIME STEP
// Units: Time [0,?]
// The frequency with which output is stored.

q.saveper = () => p.time_step()

// (22) TIME STEP= 0.125
// Units: Time [0,?]
// The time step for the simulation.

q.time_step = 0.125


// Preprocess -- All p references invoke calc of q functions

for (const key in q) {
  p[key] = () => calc(key)
}

// Simulate -- Calculate every value by name for every step

const keys = Object.keys(q).sort()
console.log(keys.map(k=>`"${k.replaceAll("_"," ")}"`).join(","))
for (let time=calc('initial_time'); time<=calc('final_time'); time+=calc('time_step')) {
  console.log(keys.map(k=>calc(k)).join(","))
  step()
}

// Runtime -- Recursively evaluate function arguments and then function

function calc(key) {
  const funct = (typeof q[key])=='function'
  const result = funct ? q[key]() : q[key]
  return result
}

// Integration -- Answer current state, then step all state

function integrate(rate,init) {
  states[rate] ||= {rate, value:init}
  return states[rate].value
}

function step() {
  for (const rate in states) {
    const state = states[rate]
    state.value += state.rate()
  }
}
