We start with a list of garden pages. This can be copy-pasted from Book Garden Validator with some exta editing.
Make sure every line is terminated with a newline.
This is saved as garden-titles.txt.
We erase the existing contents of the ./diagrams subdirectory.
Then regenerate the desired garden page diagram with this command line:

  cat garden-titles.txt | while read t; do echo $t; deno run --allow-net diagram.js $t | dot -Tpng >diagrams/$t.png; done

Then zip diagrams up and send that to Thompson.
