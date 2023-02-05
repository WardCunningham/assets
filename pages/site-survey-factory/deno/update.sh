# Update every survey
# Usage: sh update.sh

ls data |\
while read s
do deno run --allow-read --allow-write --allow-net update.js $s
done