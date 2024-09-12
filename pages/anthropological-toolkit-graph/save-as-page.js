// scrape itemized list of pages, return partial html one line per file
// deno run --allow-net save-as-page.js >all-pages.txt

const list = 'affordance agnosia aporia archaeology argumentation_theory axonometric_projection autopoiesis bifocal_ethnography blueprints boundary_objects cabling catachresis chronotopes collage_montage colligation commitment dialetheism ekphrasis emic_etic epistemography epiphany equifinality equivocation essentially_contested_concepts exaptation exemplar faithfulness figuration finitism forbearing hapax hesse_nets incommensurability infirming instauration ironic_detachment irrealism isolarion life_writing mosaic non_ergodic ostension palimpsest_memory paraethnography partiality pattern_language positioning_theory prosopography repleteness representation_nonrepresentation representational_force sgraffito stochastic_variation synaesthesia teleoanalysis things translation vagueness vignettes wicked_problems'.split(/ /)

const items = await Promise.all(list
  .map(name => `https://mambila.info/Toolkit_Hypertext/${name}.html`)
  .map(url => fetch(url)
    .then(res => res.text())
    .then(html => trim(html))))
console.log(items.join("\n"))

function trim(html) {
  return html
    .replaceAll(/\n/g,'\\n')
    .replace(/^.*<body>/,'')
    .replace(/<p>To read more.*/,'')
}