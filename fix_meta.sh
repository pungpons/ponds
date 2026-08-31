#!/bin/bash
for f in income.html asset.html duty.html dollar.html; do
  sed -i '' '/<head>/a\
    <meta name="theme-color" content="#f8fafc" media="(prefers-color-scheme: light)">\
    <meta name="theme-color" content="#020617" media="(prefers-color-scheme: dark)">' $f
done

sed -i '' '/<head>/a\
    <meta name="theme-color" content="#0f172a">' uob.html

sed -i '' '/<head>/a\
    <meta name="theme-color" content="#f1f5f9">' pharmadash.html
