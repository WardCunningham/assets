export async function history(params) {

  const url = `//${params.site}/${params.slug}.json`
  const page = await fetch(url).then(res => res.json())
  const want = params.days ? Date.now()-params.days*24*60*60*1000 : null
  const actions = page.journal.filter(action => action.id == params.id && (!want || action.date>want))
  return {summary, details, items}

  function summary() {
    const rows = actions
      .reverse()
      .map((action,i) => {
        const date = new Date(action.date||0).toLocaleString()
        const mins = action.date ? (action.date - actions[i+1]?.date||action.date)/60000 : 0
        return `<tr><td>${date}<td>${mins<60 ? `Δ${mins.toFixed(2)}m` : ''}`})
      .join("\n")
    return `<table>${rows}</table>`
  }

  function details() {
    const title = params.slug
    const text = `Item history.`
    const story = [{type:'paragraph',text},{type:'pagefold',text:'.'},...items()]
    return ({title,story})
  }

  function items() {
    const story = []
    actions.forEach(action => {
      const date = new Date(action.date||0).toLocaleString()
      story.push({type:'markdown',text:`# ${action.type} ${date}`})
      if(['add','edit'].includes(action.type))
        story.push(action.item)
    })
    return story
  }

}