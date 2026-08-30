// PONDs GAS Backend Interceptor with Local-First & Optimistic UI

(function() {
    // 1. Check if we have GAS URL
    let gasUrl = localStorage.getItem('pond_gas_url') || 'https://script.google.com/macros/s/AKfycbxWpgNAYLkjIWtGUhDpR41JBw6iHmQMvP0soutqg7RqEmfzhnzLjVDbvmSLbGV3048k/exec';
    
    // UI Logic for index.html lock screen
    const ALLOWED_EMAILS = ['wisut.pond@gmail.com', 'pungpons@gmail.com'];
    let userEmail = localStorage.getItem('pond_user_email');
    
    // Global callback for Google Sign-In
    window.handleCredentialResponse = (response) => {
        try {
            // Decode JWT
            const base64Url = response.credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const payload = JSON.parse(jsonPayload);
            
            if (ALLOWED_EMAILS.includes(payload.email) || ALLOWED_EMAILS.length === 0) {
                localStorage.setItem('pond_user_email', payload.email);
                localStorage.setItem('user_email', payload.email);
                window.location.reload();
            } else {
                const errorMsg = document.getElementById('loginErrorMsg');
                if (errorMsg) {
                    errorMsg.textContent = 'Access Denied: Unauthorized account (' + payload.email + ')';
                    errorMsg.classList.remove('hidden');
                }
            }
        } catch (e) {
            console.error('Error parsing token', e);
        }
    };

    window.addEventListener('DOMContentLoaded', () => {
        const lockScreen = document.getElementById('lockScreen');
        const loginBtn = document.getElementById('loginBtn'); // Sign out button
        
        // If this page has a lock screen (index.html)
        if (lockScreen) {
            if (userEmail) {
                lockScreen.classList.add('hidden');
                if (loginBtn) loginBtn.classList.remove('hidden');
            } else {
                lockScreen.classList.remove('hidden');
            }
        } else {
            // For other pages, redirect to index.html if not logged in
            if (!userEmail) {
                window.location.href = 'index.html';
            }
        }

        if (loginBtn) {
            loginBtn.title = "Sign Out";
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if(confirm('Sign out?')) {
                    localStorage.removeItem('pond_user_email');
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
