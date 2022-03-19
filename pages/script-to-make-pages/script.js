// This script makes pages and then writes an export file that can be loaded into any wiki
// Usage: deno run script.js > export.json

const asSlug = title => title.replace(/\s/g, '-').replace(/[^A-Za-z0-9-]/g, '').toLowerCase()
const asCopy = obj => JSON.parse(JSON.stringify(obj))

const places = [
  "45.4927389, -122.7769782 Golf Creek at Nendel's",
  "45.4930416, -122.8374077 Beaverton Creek Wetland",
  "45.4222019, -122.8099319 129th Avenue Trail",
  "45.4963044, -122.7995718 Center Street Park",
  "45.4363608, -122.7333527 PCC Sylvania",
  "45.4331838, -122.7283412 Oak Creek",
  "45.3866803, -122.7209137 Bryant Woods",
  "45.3851918, -122.7204913 Canal Acres",
  "45.3839157, -122.7286971 Heritage Park",
  "45.4197883, -122.8262150 Sunrise Trail",
  "45.4198141, -122.8324665 Cache Nature Trail",
  "45.4036328, -122.7232182 Lamont Springs",
  "45.4232803, -122.8072509 Quail Hollow",
  "45.4203983, -122.8088397 Gaarde Street Greenway",
  "45.4169352, -122.8111443 Raven Ridge Trail",
  "45.4159162, -122.8123037 Starview Drive Trail",
  "45.3936288, -122.6333920 Calaroga Court Access",
  "45.3887686, -122.6326776 Island View Trail",
  "45.3731544, -122.6201355 Willamette River Greenway",
  "45.3781565, -122.6405669 Bronco Court Access",
  "45.3613277, -122.6087991 Territorial Trail",
  "45.3643657, -122.6067860 Territorial Trail North",
  "45.3651285, -122.6429657 Tanner Creek Park",
  "45.5068732, -122.6872551 Cardenell Way Connector",
  "45.5202120, -122.7738714 Mitchell Park",
  "45.5256526, -122.7740644 Roger Tillbury Memorial Park",
  "45.4613615, -122.8450942 Summercrest Park Trail",
  "45.4738884, -122.8474473 Thornbrook Park",
  "45.4747013, -122.8401198 Mt Williams Trail",
  "45.3859027, -122.6305776 Kenthorpe Connector"
]

const exportfile = {}

for (const place of places) {
  const fields = place.match(/^(\S+ \S+) (.*)$/)
  const title = fields[2]
  const story = [
    {type:'paragraph',text:'A trail we hope to visit someday.'},
    {type:'map', text:place}
  ]
  exportfile[asSlug(title)] = finishpage({title, story})
}

function finishpage(page) {
  const date = Date.now()
  for (const item of page.story)
    item.id ||= (Math.random()*10**20).toFixed(0)
  page.journal ||= [{type:'create', date, item:asCopy(page)}]
  return page
}

console.log(JSON.stringify(exportfile))
