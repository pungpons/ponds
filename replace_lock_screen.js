const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const oldLockScreen = `          <p class="text-slate-500 dark:text-white/60 mb-8 text-sm">Sign in to sync your personalized apps and websites directly with Google Sheets.</p>
          
          <!-- Google Sign-In Button Target — button created by JS inside window.onload (same as ponds-app) -->
          <div id="google-btn-container" class="flex justify-center min-h-[44px]"></div>`;

const newLockScreen = `          <p class="text-slate-500 dark:text-white/60 mb-8 text-sm">Paste your Google Apps Script (GAS) Web App URL to connect your backend.</p>
          
          <!-- GAS URL Input -->
          <form id="gas-setup-form" class="flex flex-col gap-4">
              <input type="url" id="gas-url-input" required placeholder="https://script.google.com/macros/s/.../exec" class="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 placeholder-slate-400 dark:placeholder-white/30 focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm text-left dark:text-white">
              <button type="submit" class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 transition-all active:scale-[0.98]">
                  Connect Backend
              </button>
          </form>`;

content = content.replace(oldLockScreen, newLockScreen);

// We should also remove Google Accounts script from the head
content = content.replace(/<script src="https:\/\/accounts\.google\.com\/gsi\/client" async defer><\/script>/g, '');

fs.writeFileSync('index.html', content);
