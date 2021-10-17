# create a json file [[site, owner], ...]
# usage: ssh asia "sh login-survey.sh" > asia-owners.json
(
  cd .wiki
  echo '['
  ls | while read s
    do f=$s/status/owner.json
      if [ -f $f ]
        then echo '["'$s'"', `cat $f` '],'
      fi
    done | sed '$ s/,$//'
  echo ']'
)