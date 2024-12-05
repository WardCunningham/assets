perl -pe 's/[a-z]//g; s/^(\d).*(\d)$/$1$2/; s/^(\d)$/$1$1/' | sh sum.sh
