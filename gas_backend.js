try {
// PONDs GAS Backend Interceptor with Local-First & Optimistic UI

(function() {
    // 1. Check if we have GAS URL
    let gasUrl = localStorage.getItem('pond_gas_url') || 'https://script.google.com/macros/s/AKfycbxWpgNAYLkjIWtGUhDpR41JBw6iHmQMvP0soutqg7RqEmfzhnzLjVDbvmSLbGV3048k/exec';
    
    // UI Logic for index.html lock screen
    const ALLOWED_EMAILS = ['wisut.pond@gmail.com', 'pungpons@gmail.com'];
    let userEmail = localStorage.getItem('pond_user_email');
    if (userEmail && !localStorage.getItem('pond_ai_token')) {
        localStorage.setItem('pond_ai_token', 'gas-proxy-token');
    }
    
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
                localStorage.setItem('pond_ai_token', 'gas-proxy-token');
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


    // Unregister Service Worker to fix iOS print bug
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
            for(let registration of registrations) {
                registration.unregister();
            }
        });
    }

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
                    localStorage.removeItem('pond_ai_token');
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

        
        const urlStr = url && url.toString ? url.toString() : String(url);
        if (urlStr.includes('googleapis.com')) {
            if (!gasUrl) {
                return new Response(JSON.stringify({error: 'Not configured'}), {status: 401});
            }

            const isGet = !options.method || options.method.toUpperCase() === 'GET';
            const cacheKey = 'gas_cache_' + btoa(url);

            if (isGet) {
                let cached = localStorage.getItem(cacheKey);
                
                // Clear cache if it contains a Google Error
                if (cached && (cached.includes('"error":') || cached.includes('PERMISSION_DENIED'))) {
                    localStorage.removeItem(cacheKey);
                    cached = null;
                }

                const bgFetch = async () => {
                    try {
                        const res = await callGas(url, options, gasUrl);
                        if (res.ok) {
                            const freshText = await res.text();
                            if (!freshText.includes('"error":') && !freshText.includes('PERMISSION_DENIED')) {
                                if (cached !== freshText) {
                                    localStorage.setItem(cacheKey, freshText);
                                    window.dispatchEvent(new CustomEvent('gasDataUpdated', { detail: { url } }));
                                }
                            }
                        }
                    } catch(e) { }
                };

                if (cached) {
                    bgFetch();
                    return new Response(cached, { status: 200, statusText: 'OK', headers: {'Content-Type': 'application/json'} });
                } else {
                    const res = await callGas(url, options, gasUrl);
                    if (res.ok) {
                        const cloned = res.clone();
                        const text = await cloned.text();
                        if (!text.includes('"error":') && !text.includes('PERMISSION_DENIED')) {
                            localStorage.setItem(cacheKey, text);
                        }
                    }
                    return res;
                }
            } 
            else {
                // For non-GET requests (save, update, delete), we MUST wait for the real response.
                // Otherwise the UI receives empty data and shows blank fields until next refresh.
                const res = await callGas(url, options, gasUrl);
                
                // Invalidate cache on mutation so the next GET fetches fresh data!
                if (res.ok) {
                    const keysToRemove = [];
                    for (let i = 0; i < localStorage.length; i++) {
                        const k = localStorage.key(i);
                        if (k && k.startsWith('gas_cache_')) {
                            keysToRemove.push(k);
                        }
                    }
                    keysToRemove.forEach(k => localStorage.removeItem(k));
                }
                return res;
            }
        }
        return originalFetch.apply(this, args);
    };

    async function callGas(targetUrl, options, gasUrl) {
        let plainHeaders = {};
        if (options.headers) {
            try {
                const tempHeaders = new Headers(options.headers);
                tempHeaders.forEach((value, key) => {
                    plainHeaders[key] = value;
                });
            } catch (e) {
                plainHeaders = Object.assign({}, options.headers);
            }
        }
        
        const payload = {
            url: urlStr,
            method: options.method || 'GET',
            body: options.body,
            headers: plainHeaders
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

        let finalBody = data.body;
        if (typeof finalBody === 'string' && finalBody.startsWith('__BASE64__')) {
            const b64 = finalBody.substring(10);
            const byteCharacters = atob(b64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            finalBody = new Uint8Array(byteNumbers);
        }

        return new Response(finalBody, {
            status: data.status,
            headers: data.headers || {}
        });
    }

})();

} catch (e) { console.error("GAS Backend Error:", e); }