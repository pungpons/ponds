            // 2. iOS-style zoom-from-icon overlay
            const rect = iconBtn.getBoundingClientRect();
            const isDark = document.documentElement.classList.contains('dark');
            
            // Determine target background based on app url
            let targetBg = isDark ? '#020617' : '#f8fafc'; // Default to slate-950/slate-50
            if (app.url === 'uob.html') targetBg = '#0f172a';
            else if (app.url === 'pharmadash.html') targetBg = '#f1f5f9';

            const clone = iconBtn.cloneNode(true);
            clone.style.cssText = \`
                position: fixed;
                top: \${rect.top}px;
                left: \${rect.left}px;
                width: \${rect.width}px;
                height: \${rect.height}px;
                z-index: 99999;
                border-radius: 22%;
                margin: 0;
                transition: all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
                pointer-events: none;
                display: flex;
            \`;
            
            // Remove text from clone
            clone.innerText = '';
            
            // Create wash overlay to fade to the app's target background
            const wash = document.createElement('div');
            wash.style.cssText = \`
                position: absolute; inset: 0;
                background: \${targetBg};
                opacity: 0;
                border-radius: inherit;
                transition: opacity 0.35s ease-out;
            \`;
            clone.appendChild(wash);
            
            document.body.appendChild(clone);
            iconBtn.style.opacity = '0'; // Hide original

            // Animate to full screen
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    clone.style.top = '0px';
                    clone.style.left = '0px';
                    clone.style.width = '100vw';
                    clone.style.height = '100vh';
                    clone.style.borderRadius = '0px';
                    wash.style.opacity = '1';
                });
            });

            // Navigate while overlay is fully covering screen
            setTimeout(() => {
                window.location.href = app.url + '?v=' + new Date().getTime();
            }, 350);
