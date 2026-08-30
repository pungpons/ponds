// PONDs GAS Backend Interceptor with Local-First & Optimistic UI

(function() {
    // 1. Check if we have GAS URL
    const gasUrl = localStorage.getItem('pond_gas_url');
    
    // UI Logic for index.html lock screen
    window.addEventListener('DOMContentLoaded', () => {
        const lockScreen = document.getElementById('lockScreen');
        const gasForm = document.getElementById('gas-setup-form');
        const gasInput = document.getElementById('gas-url-input');
        const loginBtn = document.getElementById('loginBtn'); // Sign out button
        
        if (gasForm) {
            if (gasUrl) {
                // Already configured, hide lock screen
                if (lockScreen) lockScreen.classList.add('hidden');
                if (loginBtn) loginBtn.classList.remove('hidden');
            } else {
                // Show lock screen
                if (lockScreen) lockScreen.classList.remove('hidden');
            }
            
            gasForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const url = gasInput.value.trim();
                if (url.startsWith('https://script.google.com/')) {
                    localStorage.setItem('pond_gas_url', url);
                    window.location.reload();
                } else {
                    alert('Please enter a valid Google Apps Script Web App URL.');
                }
            });
        }

        if (loginBtn) {
            // Change "Sign Out" to "Disconnect"
            loginBtn.title = "Disconnect Backend";
            loginBtn.addEventListener('click', (e) => {
                // Override default logout if there is one
                e.preventDefault();
                e.stopPropagation();
                if(confirm('Disconnect GAS Backend?')) {
                    localStorage.removeItem('pond_gas_url');
                    localStorage.removeItem('pond_ai_token'); // clear old tokens
                    window.location.href = 'index.html';
                }
            });
        }
    });

    // 2. Network Interceptor
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const url = args[0];
        const options = args[1] || {};

        // Only intercept googleapis.com requests
        if (typeof url === 'string' && url.includes('googleapis.com')) {
            if (!gasUrl) {
                console.warn('GAS URL not configured. Blocking request:', url);
                return new Response(JSON.stringify({error: 'Not configured'}), {status: 401});
            }

            const isGet = !options.method || options.method.toUpperCase() === 'GET';
            const cacheKey = 'gas_cache_' + btoa(url);

            // [Local-First] - Return cached response instantly for GET requests
            if (isGet) {
                const cached = localStorage.getItem(cacheKey);
                
                // Fetch fresh data in background
                const bgFetch = async () => {
                    try {
                        const res = await callGas(url, options, gasUrl);
                        if (res.ok) {
                            const freshText = await res.text();
                            if (cached !== freshText) {
                                localStorage.setItem(cacheKey, freshText);
                                // Dispatch an event so UI can re-render if it wants to listen
                                window.dispatchEvent(new CustomEvent('gasDataUpdated', { detail: { url } }));
                            }
                        }
                    } catch(e) {
                        console.error('Background fetch failed', e);
                    }
                };

                if (cached) {
                    bgFetch(); // fire & forget
                    return new Response(cached, { status: 200, statusText: 'OK', headers: {'Content-Type': 'application/json'} });
                } else {
                    // No cache, wait for it
                    const res = await callGas(url, options, gasUrl);
                    if (res.ok) {
                        const cloned = res.clone();
                        localStorage.setItem(cacheKey, await cloned.text());
                    }
                    return res;
                }
            } 
            else {
                // [Optimistic UI / Batching for Mutations]
                // For mutations (POST, PUT, DELETE, PATCH)
                // We return a mock success response immediately to unblock the UI.
                // The actual request is sent to GAS in the background.
                
                const bgSync = async () => {
                    try {
                        await callGas(url, options, gasUrl);
                        // Optionally refresh related GET caches here if we knew them, 
                        // but usually the UI handles refetching or local state updates.
                    } catch(e) {
                        console.error('Background sync failed', e);
                        // A robust app would save to offline queue here.
                    }
                };

                bgSync(); // Fire and forget!
                
                // Return a fake successful response immediately
                return new Response(JSON.stringify({}), { status: 200, statusText: 'OK', headers: {'Content-Type': 'application/json'} });
            }
        }

        return originalFetch.apply(this, args);
    };

    async function callGas(targetUrl, options, gasUrl) {
        const payload = {
            url: targetUrl,
            method: options.method || 'GET',
            body: options.body,
            headers: options.headers || {}
        };

        const res = await originalFetch(gasUrl, {
            method: 'POST',
            // Use text/plain to avoid CORS preflight (OPTIONS)
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('GAS Network Error');
        const data = await res.json();
        
        if (data.error) throw new Error(data.error);

        return new Response(data.body, {
            status: data.status,
            headers: data.headers || {}
        });
    }

})();
