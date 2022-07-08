# report total spots per band on a ten minute interval
# usage: sh traffic.sh 2

(cd data; ls | tail -$1 |\
  while read d
  do
    if [[ ! -e ../cache/$d ]] || [[ $d -nt ../cache/$d ]]
    then
      # echo miss on $d >&2
      cat $d | jq -r '.[]|.time[0:15] +"0:00Z "+ (.tunedfrequency|tostring)[0:2]' |\
      sort | uniq -c | tee ../cache/$d
    else
      # echo hit on $d >&2
      cat ../cache/$d
    fi
  done
)
