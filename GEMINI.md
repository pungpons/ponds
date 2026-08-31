# PONDs Project Architecture & Rules

This document outlines critical architecture decisions and bug fixes for the PONDs project.

## 1. The iOS PWA Print Bug (CRITICAL)
- **Problem**: Calling \`window.print()\` inside an iOS "Add to Home Screen" PWA (Standalone Web App) reliably produces a **blank white page**, especially if the layout uses Flexbox or min-height.
- **Solution**: Do not rely on native \`window.print()\` inside the PWA. Instead, intercept the print button, extract the DOM you want to print (e.g. \`#report-printable-preview\`), and open it in a NEW window (\`window.open('', '_blank')\`).
- **Why it works**: \`window.open()\` breaks the user out of the PWA standalone mode and opens standard Safari, where the print dialog works perfectly.
- **Print CSS Overrides**: 
  - Use \`zoom: 0.6\` (or similar) on the \`body\` to shrink absolute/pixel-based font sizes uniformly so data fits horizontally.
  - Use \`@page { margin: 5mm; }\` to maximize printable area.
  - Apply \`page-break-inside: avoid !important\` to cards/sections so they don't split across pages.
  - Apply \`word-wrap: break-word !important; white-space: normal !important; max-width: 100% !important;\` to prevent text from spilling off the page.

## 2. Google Apps Script (GAS) Proxy Architecture
- **Purpose**: Bypasses Google's 3rd-party cookie restrictions on iOS Safari.
- **Mechanism**: \`gas_backend.js\` intercepts all \`fetch\` calls to \`googleapis.com\`. It wraps the request in a JSON payload (\`{action: "proxy", url, method, body, headers}\`) and POSTs it to the GAS Web App.
- **Binary Files (Images)**: \`FormData\` cannot be proxied natively via JSON. Binary uploads (like Drive images) must be manually constructed as multipart strings in the frontend. When GAS returns an image, it encodes it as base64 prefixed with \`__BASE64__\`. The frontend interceptor decodes this string back into a \`Blob\` / \`Uint8Array\`.
- **Caching (Local-First)**: \`gas_backend.js\` implements a local-first cache using \`localStorage\` (\`gas_cache_...\`). It serves stale data instantly (0.1s load time) and fetches fresh data in the background. Do not implement UI loading spinners that block the cached view.

## 3. General Rules
- **No Service Worker for HTML**: Do not register a Service Worker for intercepting HTML/Network requests, as it historically conflicts with the iOS print engine.
- **Vercel Deployments**: Do not run \`vercel --prod\` locally. Push changes to GitHub and let Vercel auto-deploy.

## 4. Smart Background Sync (V2 Headless Mode)
- **Problem**: Pre-fetching apps via hidden iframes on the index page consumes excessive CPU/RAM because it evaluates React and Tailwind CDN multiple times.
- **Solution**: The index page now reads all `gas_cache_*` keys from `localStorage`, decodes the URLs, and fires headless `fetch()` requests. `gas_backend.js` intercepts these, sees they are GET requests with existing cache, and triggers `backgroundFetch()` which quietly updates the JSON in `localStorage` without evaluating any DOM/UI code.
- **Fallback**: If `localStorage` is completely empty (new device), it falls back to the iframe method for the core apps (`uob`, `asset`, `income`, `dollar`, `duty`).
