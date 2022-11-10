// embolden lines from graphviz svg nodes on hover

export function hoverbold(div,select='both') {
  let rels = [] // [[edge, from, to], ...]
  const title = target => target.querySelector('title').textContent.replace(/\\n/g,' ')
  div.querySelectorAll('.edge').forEach(edge => rels.push([edge, ...title(edge).split('->')]))
  const trace = (node,doit) => {
    const related = io => rels.filter(row => row[io]==node)
    switch (select) {
      case 'output':
        related(1).map(row => doit(row[0]))
        break
      case 'input':
        related(2).map(row => doit(row[0]))
        break
      case 'both':
        related(1).map(row => doit(row[0]))
        related(2).map(row => doit(row[0]))
        break
      case 'most':
        let o = related(1).length
        let i = related(2).length
        related(o>i?1:2).map(row => doit(row[0]))
        break
    }
  }
  const stroke = width => {
    const adjust = edge => edge.setAttribute('stroke-width',width)
    return event => trace(title(event.target), adjust)
  }
  div.querySelectorAll('.node').forEach(node => {
    node.addEventListener('mouseenter',stroke(3))
    node.addEventListener('mouseleave',stroke(1))
  })
}
