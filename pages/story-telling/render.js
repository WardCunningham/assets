
// import {count,trouble} from './print-stats.js'
import {asSlug} from 'http://code.fed.wiki/assets/v1/frame.js'
const words = text => text.split(/\W+/).length

function resolve(page, text) {
  const link = /\[\[(.*?)\]\]/g
  return text.replace(link, (match, word) => {
    // let title = prefer(word)
    let title = word
    // if (!titles.includes(title) && !refs.includes(title)) {
    //   refs.push(title)
    // }
    // if (ispresent(title)) {
    if(true) {
      // console.log('present',disposition,page.title,'->',title)
      // if(true) // disposition=='alphabetized')
      //   dot.push(`${quote(page.title)} -> ${quote(title)}`)
      return `<a href=#${asSlug(title)}>${title}</a>`
    }
    else {
      console.log('absent',page.title,'->',title)
      // trouble(`Can't link to ${title}`, page.title)
      return `<font color=gray>${title}</font>`
    }
  }).replace(/\[(https?:.*?) (.*?)\]/g,'<a href="$1">$2</a>'+linkmark())
}

export function render (site, page) {
  let slug = asSlug(page.title)
  let head = `<h2 id="${slug}">${page.title}<a href="http://${site}/${slug}.html" target=_blank> ⬀ </a></h2>`
  let html = [head]
  for (let item of page.story) {
    switch (item.type) {

      case 'paragraph':
        // count(`words ${disposition} (render)` ,words(item.text))
        html.push(`<p>${resolve(page, item.text)}</p>`)
        break

      case 'image':
        html.push(`<p><img width=100% src="${item.source || item.url}"><center>${resolve(page, item.text || item.caption)}</center></p>`)
        break

      case 'reference':
        html.push(`<p>${resolve(page, `[[${item.title}]]`)} — ${resolve(page, item.text)}<p>`)
        break

      case 'html':
        let div = document.createElement('div')
        div.innerHTML = item.text
        html.push(`<div>${resolve(page, div.innerHTML)}</div>`)
        break

      case 'markdown':
        // count(`words ${disposition} (render)`,words(item.text))
        let text = item.text.trim()
        text = text.replace(/\*\*(.+?)\*\*/g,"<b>$1</b>")
        text = text.replace(/\*(.+?)\*/g,"<b>$1</b>")
        text = text.replace(/_(.+?)_/g,"<i>$1</i>")
        text = text.replace(/(\n|^)- /g,"$1● ")
        text = text.replace(/\n|$/g,"<br>\n")
        text = text.replace(/# (.*?)<br>/g,"<h3>$1</h3>")
        // if (text.match(/^[*+]/) || ((text.match(/[*]/g)||[]).length%2))
        //   trouble('This markdown too hard', page.title)
        html.push(`<p>${resolve(page, text)}</p>`)
        break

      case 'pagefold':
        html.push(`<div style="height: 10px; border-top: 2px solid lightgray; margin-top: 24px; text-align: center; position: relative; clear: both;">
            <span style="position: relative; top: -.8em; background: white; display: inline-block; color: gray; ">
              &nbsp; ${item.text} &nbsp;
            </span>
          </div>`)
        break

      case 'graphviz':
        // count('graphviz diagrams omitted')
        break

      default:
        // trouble(`Can't yet print ${item.type}`, page.title)
        console.log('render trouble', item)
    }
  }
  return html
}

export function linkmark() {
  return `<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAC0WlDQ1BJQ0MgUHJvZmlsZQAAKJGNlM9LFGEYx7+zjRgoQWBme4ihQ0ioTBZlROWuv9i0bVl/lBLE7Oy7u5Ozs9PM7JoiEV46ZtE9Kg8e+gM8eOiUl8LALALpblFEgpeS7Xlnxt0R7ccLM/N5nx/f53nf4X2BGlkxTT0kAXnDsZJ9Uen66JhU+xEhHEEdwqhTVNuMJBIDoMFjsWtsvofAvyute/v/OurStpoHhP1A6Eea2Sqw7xfZC1lqBBC5XsOEYzrE9zhbnv0x55TH8659KNlFvEh8QDUtHv+auEPNKWmgRiRuyQZiUgHO60XV7+cgPfXMGB6k73Hq6S6ze3wWZtJKdz9xG/HnNOvu4ZrE8xmtN0bcTM9axuod9lg4oTmxIY9DI4YeH/C5yUjFr/qaoulEk9v6dmmwZ9t+S7mcIA4TJ8cL/TymkXI7p3JD1zwW9KlcV9znd1Yxyeseo5g5U3f/F/UWeoVR6GDQYNDbgIQk+hBFK0xYKCBDHo0iNLIyN8YitjG+Z6SORIAl8q9TzrqbcxtFyuZZI4jGMdNSUZDkD/JXeVV+Ks/JX2bDxeaqZ8a6qanLD76TLq+8ret7/Z48fZXqRsirI0vWfGVNdqDTQHcZYzZcVeI12P34ZmCVLFCpFSlXadytVHJ9Nr0jgWp/2j2KXZpebKrWWhUXbqzUL03v2KvCrlWxyqp2zqtxwXwmHhVPijGxQzwHSbwkdooXxW6anRcHKhnDpKJhwlWyoVCWgUnymjv+mRcL76y5o6GPGczSVImf/4RVyGg6CxzRf7j/c/B7xaOxIvDCBg6frto2ku4dIjQuV23OFeDCN7oP3lZtzXQeDj0BFs6oRavkSwvCG4pmdxw+6SqYk5aWzTlSuyyflSJ0JTEpZqhtLZKi65LrsiWL2cwqsXQb7Mypdk+lnnal5lO5vEHnr/YRsPWwXP75rFzeek49rAEv9d/AvP1FThgxSQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAKtJREFUGJVtkLERwjAMRZ+5UHmmNNpCrpMloMi5gCXcO1MkLWwBS6SCO1EQgkP4d2q+nr50cmZGqbZt18YsV4IxRqv2FcfD8XeYXWl0Xefutzsxxk1iFUJYrfLeU9f1BtwB5JzJOeO9R1UREcZxXCVX5R0l1Pc9AKfz6ZsIoKpcrpcFmqaJlJJ7Pp6klByqah8Nw2BN05iZ2ezzqWU1gIggIv/e+AZDCH+bpV442lpGxygDswAAAABJRU5ErkJggg==" alt="" />`
}

export let prolog = `
    <meta charset="utf-8"/>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🟢</text></svg>">
    <style>
      body { font-family:helvetica; width:550px; }
      h2 { page-break-before:always; }
      a { text-decoration:none; }
    </style>`
