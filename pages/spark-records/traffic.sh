# report total spots per band on a ten minute interval
# usage: sh traffic.sh 2

(cd data; cat `ls | tail -$1`) |\
  jq -r '.[]|.time[0:15] +"0:00Z "+ (.tunedfrequency|tostring)[0:2]' |\
  sort | uniq -c
