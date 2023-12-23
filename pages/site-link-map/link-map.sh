# create dot from sitemap.json
# usage: sh link-map.sh tree.tries.fed.wiki

echo 'digraph {'
echo 'node [shape=box style=filled fillcolor=palegreen]'
curl -s $1/system/sitemap.json | jq -r '.[].slug'
echo 'node [fillcolor=white]'
curl -s $1/system/sitemap.json | jq -r '.[]|select(.links)|.slug +" -> {"+ (.links|keys|join(" ")) +"}"'
echo '}'
