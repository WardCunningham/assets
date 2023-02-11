# Launch a deno update from amateur-call-sign-survey page
# Usage: sh launch.sh domain

curl -s http://$1/amateur-call-sign-survey.json |\
  jq '.story[]|select(.type=="frame")|.survey' >call-data/$1


# copy([...document.querySelectorAll('div.search img.remote')]
#   .filter(e => e.dataset.slug == 'amateur-call-sign-survey')
#   .map(e => e.dataset.site)
#   .join(' '))

# for i in ft8.ward.asia.wiki.org video.fed.wiki.org hsc.fed.wiki round.asia.wiki.org found.ward.bay.wiki.org cactus.asia.wiki.org ward.bay.wiki.org found.ward.fed.wiki trails.ward.asia.wiki.org
# do echo $i
#   sh launch.sh $i
# done
