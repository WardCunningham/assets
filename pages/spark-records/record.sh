# Restart spark spot recording after reboot
# Usage: * * * * * (cd ~/FedWiki/assets/pages/spark-records; sh record.sh)

ps >/tmp/ps.txt
grep record.js /tmp/ps.txt
status=$?
if [ $status -eq 0 ]
  then exit 0
fi

echo `date` reboot >>record.txt
while true; do
  echo `date` restart >> record.txt
  /usr/local/bin/deno run --allow-net --allow-write=data record.js 10.0.1.113 2>&1 > /tmp/record.txt
  mv /tmp/record.txt /tmp/record.bak
  sleep 10
done &
