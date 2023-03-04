// Find all located and captioned images
// See http://photos.ward.dojo.fed.wiki/image-caption-survey-probe.html

export const version = '0.1.0'

// {
// "type": "image",
// "id": "6f5472890e6cc304",
// "location": {
//   "latitude": "45.469475",
//   "longitude": "-122.7462"
// },
// "text": "signage location",
// "size": "wide",
// "width": 420,
// "height": 315,
// "url": "/assets/plugins/image/4a9a1b8cc6615708e05bcade8568bf8a.jpg"
// },

export function probe(page) {
  console.log('probe',page.title)
  const images = page.story
    .filter(item => item.type=='image' && 'size' in item)
    .map(item => ({
      text:item.text,
      latlon:[
        +(+item.location?.latitude).toFixed(7),
        +(+item.location?.longitude).toFixed(7)
      ],
      url:item.url,
      id:item.id
    }))
  console.log('images',images)
  return {images}
}

export function format(survey) {
  return survey
    .filter(info => info.images?.length)
    .map(info => `[[${info.title}]]<br>${info.images.map(item=>item.text).join("<br>")}`)
    .sort()
    .join('<br>')
}
