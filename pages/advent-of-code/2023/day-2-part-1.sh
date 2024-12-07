while read game; do g=`cut -d ':' -f 1 | cut -d ' ' -f 2`;
  echo $g;
done
