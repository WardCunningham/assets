curl -s 'https://pskreporter.info/cgi-bin/pskdata.pl?adif=1&days=7&receiverCallsign=k9ox'| \
  perl -ne 'print "$1\t$2\n" if /<CALL:\d+>(.*?)<.*?<GRIDSQUARE:\d+>(.*?)</' | sort | uniq > callbook.txt