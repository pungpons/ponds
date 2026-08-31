#!/bin/bash
for f in income.html asset.html; do
  sed -i '' '/<style id="page-enter-anim">/c\
<script id="theme-flash-fix">try { if (localStorage.getItem("theme") === "dark" || (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)) { document.documentElement.classList.add("dark"); } } catch(e) {}</script>\
<style id="page-enter-anim">' $f
  
  sed -i '' 's/@media (prefers-color-scheme: dark) { html { background: #020617; } }/html.dark { background: #020617; }/' $f
done
