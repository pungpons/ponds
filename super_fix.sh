#!/bin/bash
SCRIPT_SNIPPET='<script>try{if(localStorage.theme==="dark"||(!("theme" in localStorage)&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark");}}catch(e){}</script>'

for f in income.html asset.html dollar.html duty.html; do
  # Remove any old theme-flash-fix scripts if they exist
  sed -i '' '/<script id="theme-flash-fix">/d' $f
  
  # Insert the blocking script right after <head>
  sed -i '' "s|<head>|<head>$SCRIPT_SNIPPET|g" $f
  
  # Ensure the html background is dark if .dark is present, to prevent the 1 frame React white gap
  sed -i '' 's/@media (prefers-color-scheme: dark) { html { background: #020617; } }/html.dark { background: #020617; } @media (prefers-color-scheme: dark) { html:not(.light) { background: #020617; } }/g' $f
done
