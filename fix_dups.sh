#!/bin/bash
for f in income.html asset.html; do
  # Keep only the last occurrence of the theme-color tags (or delete them all and add one pair back)
  sed -i '' '/<meta name="theme-color"/d' $f
  sed -i '' '/<head>/a\
    <meta name="theme-color" content="#f8fafc" media="(prefers-color-scheme: light)">\
    <meta name="theme-color" content="#020617" media="(prefers-color-scheme: dark)">' $f
done
