# report 10 most wanted stations on a ten minute interval over last 2 days
# usage: sh wanted.sh 2 10

ls data | tail -$1 | while read day; do
  # echo day $day
  # cat data/$day |\
  #   jq -r '.[]|.time[0:15] +"0:00Z "' |\
  #     sort | uniq | wc -l

  export pattern=`cat data/$day |\
    jq -r '.[]|(.msg|capture("(?<a>[A-Z]+[0-9]+[A-Z]+)")|.a)' |\
      sort | uniq -c | sort -n | tail -$2 |\
        awk '{print $2}' | awk 'ORS="|"'`
  # echo $pattern

  cat data/$day |\
    jq -rj '.[]|(.time[0:15]),("0Z "),(.msg|capture("(?<a>'$pattern'K9OX)","n")|.a),("\n")' |\
      egrep -v ':\d0Z *$' | sort | uniq -c | head -20

done
