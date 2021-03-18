export {start}

const rn = () => Math.floor(50*(Math.random()+Math.random()))

function start(agents) {

  place()
  connect()
  network()

  function place() {
    const occupied = {}
    for (let i =0; i<agents.length; i++) {
      let xy = [rn(), rn()]
      if (occupied[xy]) {
        i--
      } else {
        let color = Math.random()<0.5 ? 'purple' : 'green'
        occupied[xy] = agents[i] = {xy, color}
      }
    }
  }

  function connect() {
    for (let agent of agents) {
      const dist = other => Math.abs(agent.xy[0]-other.xy[0])+Math.abs(agent.xy[1]-other.xy[1])
      agent.closest = agents
        .slice()
        .sort((a, b) => dist(a) - dist(b))
        .slice(1,5)
    }
  }

  function network() {
    for (let agent of agents) {
      speaking(agent)
    }
  }

  async function speaking(agent) {
    const delay = async ms => new Promise(resolve => setTimeout(resolve, ms))
    while(true) {
      await delay(rn() * (agent.color == 'purple' ? 20 : 30))
      for (let other of agent.closest) {
        listening(other, agent)
      }
    }
  }

  function listening(agent, other) {
    if (rn() < 30 && agent.color != other.color) {
      agent.color = other.color
    }
  }

}