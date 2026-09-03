// --- Settings & Theme Management ---
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const settingsLogoutBtn = document.getElementById('settingsLogoutBtn');

const openThemeBtn = document.getElementById('open-theme-btn');
const backToSettingsBtn = document.getElementById('back-to-settings-btn');
const settingsMainView = document.getElementById('settings-main-view');
const settingsThemeView = document.getElementById('settings-theme-view');

if (openThemeBtn && backToSettingsBtn) {
    openThemeBtn.addEventListener('click', () => {
        settingsMainView.classList.add('hidden');
        settingsThemeView.classList.remove('hidden');
    });
    
    backToSettingsBtn.addEventListener('click', () => {
        settingsThemeView.classList.add('hidden');
        settingsMainView.classList.remove('hidden');
    });
}

const themeMeta = document.getElementById('theme-color-meta');

// Display Mode logic
const THEMES = ['auto', 'light', 'dark'];
let currentDisplayMode = localStorage.getItem('theme') || 'auto';

function updateDisplayModeButtons() {
    ['light', 'dark', 'auto'].forEach(mode => {
        const btn = document.getElementById('btn-theme-' + mode);
        if (!btn) return;
        if (mode === currentDisplayMode) {
            btn.classList.add('bg-white', 'dark:bg-slate-700', 'shadow-sm', 'text-indigo-600', 'dark:text-indigo-400');
            btn.classList.remove('text-slate-600', 'dark:text-white/60');
        } else {
            btn.classList.remove('bg-white', 'dark:bg-slate-700', 'shadow-sm', 'text-indigo-600', 'dark:text-indigo-400');
            btn.classList.add('text-slate-600', 'dark:text-white/60');
        }
    });
}

function applyDisplayMode(mode, isInit = false, skipSave = false) {
    let isDark = false;
    if (mode === 'auto') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
        isDark = mode === 'dark';
    }

    if (isDark) {
        document.documentElement.classList.add('dark');
        updateMetaThemeColor();
    } else {
        document.documentElement.classList.remove('dark');
        updateMetaThemeColor();
    }

    if (!isInit) {
        localStorage.setItem('theme', mode);
        currentDisplayMode = mode;
        updateDisplayModeButtons();
        if (typeof renderApps === 'function') renderApps();
        if (!skipSave && typeof saveApps === 'function') saveApps();
    }
}

// Color Theme Logic
let currentColorTheme = localStorage.getItem('pond_color_theme') || 'default';

function updateMetaThemeColor() {
    setTimeout(() => {
        const bgColor = getComputedStyle(document.documentElement).getPropertyValue('background-color');
        if (bgColor) {
            document.querySelectorAll('meta[name="theme-color"]').forEach(m => m.setAttribute('content', bgColor));
        }
    }, 50);
}

function applyColorTheme(themeName, skipSave = false) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('pond_color_theme', themeName);
    currentColorTheme = themeName;
    updateMetaThemeColor();
    if (!skipSave && typeof saveApps === 'function') saveApps();
    // Update active swatch state
    document.querySelectorAll('[data-set-theme]').forEach(btn => {
        if (btn.getAttribute('data-set-theme') === themeName) {
            btn.classList.add('border-indigo-600', 'dark:border-white', 'scale-110');
            btn.classList.remove('border-transparent');
        } else {
            btn.classList.remove('border-indigo-600', 'dark:border-white', 'scale-110');
            btn.classList.add('border-transparent');
        }
    });
}

// Event Listeners for Display Mode
['light', 'dark', 'auto'].forEach(mode => {
    const btn = document.getElementById('btn-theme-' + mode);
    if (btn) {
        btn.addEventListener('click', () => applyDisplayMode(mode));
    }
});

// Event Listeners for Color Themes
document.querySelectorAll('[data-set-theme]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        applyColorTheme(e.target.getAttribute('data-set-theme'));
    });
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (currentDisplayMode === 'auto') applyDisplayMode('auto', true);
});

// Init Themes
applyDisplayMode(currentDisplayMode, true);
updateDisplayModeButtons();
applyColorTheme(currentColorTheme, true);


const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        let newMode = 'auto';
        if (currentDisplayMode === 'auto') newMode = 'light';
        else if (currentDisplayMode === 'light') newMode = 'dark';
        else newMode = 'auto';
        
        applyDisplayMode(newMode);
        
        // Update Icon
        if (themeIcon) {
            if (newMode === 'auto') {
                themeIcon.innerHTML = '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" fill="none"></circle><path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor"></path>';
            } else if (newMode === 'dark') {
                themeIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>';
            } else {
                themeIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>';
            }
        }
    });
    
    // Set initial icon
    if (themeIcon) {
        if (currentDisplayMode === 'auto') themeIcon.innerHTML = '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" fill="none"></circle><path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor"></path>';
        else if (currentDisplayMode === 'dark') themeIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>';
        else themeIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>';
    }
}

// Settings Modal Toggles
if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
        settingsModal.classList.add('flex');
    });
}
if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
        settingsModal.classList.remove('flex');
    });
}
// Close on outside click
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.classList.add('hidden');
        settingsModal.classList.remove('flex');
    }
});

// Auth Logout Logic
const pondToken = localStorage.getItem('pond_ai_token');
if (pondToken && settingsLogoutBtn) {
    settingsLogoutBtn.classList.remove('hidden');
    settingsLogoutBtn.addEventListener('click', () => {
        if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
            localStorage.removeItem('pond_ai_token');
            localStorage.removeItem('pond_user_email');
            localStorage.removeItem('user_email');
            window.location.reload();
        }
    });
}

// Google Sign-In init

const appsGrid = document.getElementById('appsGrid');
let sortableInstance = null;


const PREDEFINED_COLORS = [
    'linear-gradient(135deg, rgba(255, 75, 107, 0.85), rgba(255, 123, 82, 0.85))',
    'linear-gradient(135deg, rgba(43, 75, 138, 0.85), rgba(59, 107, 168, 0.85))',
    'linear-gradient(135deg, rgba(52, 199, 89, 0.85), rgba(48, 209, 88, 0.85))',
    'linear-gradient(135deg, rgba(255, 149, 0, 0.85), rgba(255, 159, 10, 0.85))',
    'linear-gradient(135deg, rgba(88, 86, 214, 0.85), rgba(94, 92, 230, 0.85))',
    'linear-gradient(135deg, rgba(255, 45, 85, 0.85), rgba(255, 55, 95, 0.85))',
    'linear-gradient(135deg, rgba(0, 122, 255, 0.85), rgba(10, 132, 255, 0.85))',
    'linear-gradient(135deg, rgba(255, 204, 0, 0.85), rgba(255, 214, 10, 0.85))',
    'linear-gradient(135deg, rgba(142, 142, 147, 0.85), rgba(152, 152, 157, 0.85))',
    'linear-gradient(135deg, rgba(175, 82, 222, 0.85), rgba(191, 90, 242, 0.85))',
    'linear-gradient(135deg, rgba(200, 182, 255, 0.85), rgba(255, 182, 193, 0.85))',
    'linear-gradient(135deg, rgba(14, 165, 233, 0.85), rgba(56, 189, 248, 0.85))',
    'linear-gradient(135deg, rgba(20, 184, 166, 0.85), rgba(45, 212, 191, 0.85))',
    'linear-gradient(135deg, rgba(236, 72, 153, 0.85), rgba(244, 114, 182, 0.85))',
    'linear-gradient(135deg, rgba(99, 102, 241, 0.85), rgba(129, 140, 248, 0.85))',
    'linear-gradient(135deg, rgba(168, 85, 247, 0.85), rgba(192, 132, 252, 0.85))',
    'linear-gradient(135deg, rgba(244, 63, 94, 0.85), rgba(251, 113, 133, 0.85))',
    'linear-gradient(135deg, rgba(249, 115, 22, 0.85), rgba(251, 146, 60, 0.85))',
    'linear-gradient(135deg, rgba(16, 185, 129, 0.85), rgba(52, 211, 153, 0.85))',
    'linear-gradient(135deg, rgba(234, 179, 8, 0.85), rgba(250, 204, 21, 0.85))',
    'linear-gradient(135deg, rgba(253, 164, 175, 0.85), rgba(254, 205, 211, 0.85))',
    'linear-gradient(135deg, rgba(147, 197, 253, 0.85), rgba(191, 219, 254, 0.85))',
    'linear-gradient(135deg, rgba(167, 243, 208, 0.85), rgba(209, 250, 229, 0.85))',
    'linear-gradient(135deg, rgba(253, 230, 138, 0.85), rgba(254, 240, 138, 0.85))',
    'linear-gradient(135deg, rgba(216, 184, 255, 0.85), rgba(233, 213, 255, 0.85))',
    'linear-gradient(135deg, rgba(30, 41, 59, 0.85), rgba(51, 65, 85, 0.85))',
    'linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(30, 58, 138, 0.85))',
    'linear-gradient(135deg, rgba(63, 63, 70, 0.85), rgba(82, 82, 91, 0.85))',
    'linear-gradient(135deg, rgba(69, 10, 10, 0.85), rgba(127, 29, 29, 0.85))',
    'linear-gradient(135deg, rgba(20, 83, 45, 0.85), rgba(22, 101, 52, 0.85))'
];

let myApps = [
    { id: 1, name: 'Assets', url: 'asset.html', lightGradient: 'linear-gradient(135deg, #ff4b6b, #ff7b52)', darkGradient: 'linear-gradient(135deg, #d13a55, #d16240)', icon: 'A' },
    { id: 2, name: 'Income', url: 'income.html', lightGradient: 'linear-gradient(135deg, #ffd060, #ffa060)', darkGradient: 'linear-gradient(135deg, #d1a646, #cc7b43)', icon: 'I' },
    { id: 3, name: 'UOB', url: 'uob.html', lightGradient: 'linear-gradient(135deg, #2b4b8a, #3b6ba8)', darkGradient: 'linear-gradient(135deg, #1d3566, #2b5182)', icon: 'U' },
    { id: 4, name: 'Duty', url: 'duty.html', lightGradient: 'linear-gradient(135deg, #c8b6ff, #ffb6c1)', darkGradient: 'linear-gradient(135deg, #9281c7, #bf828b)', icon: 'D' },
    { id: 5, name: 'Dollar', url: 'dollar.html', lightGradient: 'linear-gradient(135deg, #34f08c, #34e0a1)', darkGradient: 'linear-gradient(135deg, #21ba68, #21ad79)', icon: 'D' },
    { id: 6, name: 'Pharma', url: 'pharmadash.html', lightGradient: 'linear-gradient(135deg, #ff9a9e, #fecfef)', darkGradient: 'linear-gradient(135deg, #c7565b, #b57a9e)', icon: 'P' },
];

let isEditMode = false;


let cloudConfigFileId = null;

async function loadAppsFromCloud(token) {
    try {
        const searchRes = await fetch("https://www.googleapis.com/drive/v3/files?q=" + encodeURIComponent("name='pond_ai_config.json' and trashed=false"), {
            headers: { Authorization: `Bearer ${token}` }
        });
        const searchData = await searchRes.json();
        
        if (searchData.files && searchData.files.length > 0) {
            cloudConfigFileId = searchData.files[0].id;
            const contentRes = await fetch(`https://www.googleapis.com/drive/v3/files/${cloudConfigFileId}?alt=media`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const cloudData = await contentRes.json();
            if (cloudData) {
                // Backward compatibility: if it's an array, it's just apps. Otherwise it's an object.
                const cloudApps = Array.isArray(cloudData) ? cloudData : (cloudData.apps || []);
                
                // Sync Theme Preferences
                if (!Array.isArray(cloudData)) {
                    if (cloudData.displayMode && cloudData.displayMode !== currentDisplayMode) {
                        applyDisplayMode(cloudData.displayMode, false, true); // true = skip save to prevent loop
                        updateDisplayModeButtons();
                    }
                    if (cloudData.colorTheme && cloudData.colorTheme !== currentColorTheme) {
                        applyColorTheme(cloudData.colorTheme, true); // true = skip save
                    }
                }
                
                cloudApps.forEach(app => {
                    // Force core apps to use relative URLs regardless of what is in the cloud config
                    // This prevents PWA domain escaping if an old absolute URL was accidentally saved
                    if (app.id === 1) app.url = 'asset.html';
                    if (app.id === 2) app.url = 'income.html';
                    if (app.id === 3) app.url = 'uob.html';
                    if (app.id === 4) app.url = 'duty.html';
                    if (app.id === 5) app.url = 'dollar.html';
                    if (app.id === 6) app.url = 'pharmadash.html';
                });
                const oldAppsStr = JSON.stringify(myApps);
                const newAppsStr = JSON.stringify(cloudApps);
                
                myApps = cloudApps;
                localStorage.setItem('pond_myApps', JSON.stringify(myApps));
                
                // Only re-render if the cloud data is actually different from local storage.
                // This prevents the "double refresh/bloom" animation on page load.
                if (oldAppsStr !== newAppsStr) {
                    renderApps();
                    initSortable();
                }
            }
        } else {
            await saveAppsToCloud(token, true);
        }
    } catch (err) {
        console.error("Cloud sync failed:", err);
    }
}

async function saveAppsToCloud(token, isCreate = false) {
    if (!token) return;
    try {
        if (!cloudConfigFileId) {
            // Check if it already exists before creating to prevent duplicates
            const searchRes = await fetch("https://www.googleapis.com/drive/v3/files?q=" + encodeURIComponent("name='pond_ai_config.json' and trashed=false"), {
                headers: { Authorization: `Bearer ${token}` }
            });
            const searchData = await searchRes.json();
            if (searchData.files && searchData.files.length > 0) {
                cloudConfigFileId = searchData.files[0].id;
            }
        }

        if (isCreate || !cloudConfigFileId) {
            // 1. Create empty file metadata
            const metaRes = await fetch('https://www.googleapis.com/drive/v3/files', {
                method: 'POST',
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: 'pond_ai_config.json', mimeType: 'application/json' })
            });
            const metaData = await metaRes.json();
            if (metaData.id) {
                cloudConfigFileId = metaData.id;
            } else {
                throw new Error("Failed to create file metadata");
            }
        }
        
        // 2. Upload content via PATCH media
        const payload = {
            apps: myApps,
            displayMode: currentDisplayMode,
            colorTheme: currentColorTheme
        };
        await fetch(`https://www.googleapis.com/upload/drive/v3/files/${cloudConfigFileId}?uploadType=media`, {
            method: 'PATCH',
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
    } catch (err) {
        console.error("Failed to save to cloud:", err);
    }
}

let cloudSaveTimeout = null;
function saveApps() {
    localStorage.setItem('pond_myApps', JSON.stringify(myApps));
    const token = localStorage.getItem('pond_ai_token');
    if (token) {
        clearTimeout(cloudSaveTimeout);
        cloudSaveTimeout = setTimeout(() => {
            saveAppsToCloud(token);
        }, 1500); // 1.5s debounce to prevent spamming Google Drive API
    }
}

function loadApps() {
    const saved = localStorage.getItem('pond_myApps');
    if (saved) {
        try {
            myApps = JSON.parse(saved);
            myApps.forEach(app => {
                // Force relative URLs for core apps
                if (app.id === 1) app.url = 'asset.html';
                if (app.id === 2) app.url = 'income.html';
                if (app.id === 3) app.url = 'uob.html';
                if (app.id === 4) app.url = 'duty.html';
                if (app.id === 5) app.url = 'dollar.html';
                if (app.id === 6) app.url = 'pharmadash.html';
            });
        } catch(e) {}
    }
}

// Load before render
loadApps();

// Modal elements
const modal = document.getElementById('app-modal');
const form = document.getElementById('app-form');
const closeBtn = document.getElementById('close-modal-btn');
const inputId = document.getElementById('app-id');
const inputName = document.getElementById('app-name');
const colorSelectors = document.getElementById('color-selectors');

function initColorSelectors() {
    colorSelectors.innerHTML = '';
    PREDEFINED_COLORS.forEach((color, index) => {
        const label = document.createElement('label');
        label.className = 'cursor-pointer p-1';
        label.innerHTML = `
            <input type="radio" name="app-color" value="${color}" class="peer sr-only">
            <div class="w-8 h-8 rounded-full ring-offset-2 ring-offset-white dark:ring-offset-[#0f172a] peer-checked:ring-2 ring-indigo-400 transition-all border border-black/20 dark:border-white/10" style="background: ${color}"></div>
        `;
        colorSelectors.appendChild(label);
    });
}
initColorSelectors();


const iconUpload = document.getElementById('icon-upload');
const iconPreview = document.getElementById('icon-preview');
const iconPreviewText = document.getElementById('icon-preview-text');
const removeIconBtn = document.getElementById('remove-icon-btn');
const customIconBase64Input = document.getElementById('custom-icon-base64');


// Live preview of the first letter/emoji
inputName.addEventListener('input', (e) => {
    if (!customIconBase64Input.value) {
        const val = e.target.value.trim();
        iconPreviewText.innerText = val ? [...val][0] : '?';
    }
});

// Image upload and resize handler

iconUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            // Resize image using Canvas (Max 128x128 for app icon)
            const canvas = document.createElement('canvas');
            const MAX_SIZE = 150;
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
                if (width > MAX_SIZE) {
                    height *= MAX_SIZE / width;
                    width = MAX_SIZE;
                }
            } else {
                if (height > MAX_SIZE) {
                    width *= MAX_SIZE / height;
                    height = MAX_SIZE;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Compress to WebP or JPEG
            const base64 = canvas.toDataURL('image/jpeg', 0.85);
            
            // Update UI
            customIconBase64Input.value = base64;
            iconPreview.style.backgroundImage = `url(${base64})`;
            iconPreview.style.backgroundSize = 'cover';
            iconPreview.style.backgroundPosition = 'center';
            iconPreviewText.style.display = 'none';
            removeIconBtn.classList.remove('hidden');
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

removeIconBtn.addEventListener('click', () => {
    customIconBase64Input.value = '';
    iconUpload.value = '';
    iconPreview.style.backgroundImage = '';
    iconPreviewText.style.display = 'block';
    removeIconBtn.classList.add('hidden');
    
    // Set preview color to currently selected radio color
    const selectedRadio = document.querySelector('input[name="app-color"]:checked');
    if (selectedRadio) {
        iconPreview.style.background = selectedRadio.value;
    }
});

// Update modal color preview live
document.getElementById('color-selectors').addEventListener('change', (e) => {
    if (e.target.name === 'app-color' && !customIconBase64Input.value) {
        iconPreview.style.background = e.target.value;
    }
});

function openModal(app) {
    inputId.value = app.id;
    inputName.value = app.name;
    customIconBase64Input.value = app.customIconBase64 || '';
    
    if (app.customIconBase64) {
        iconPreview.style.backgroundImage = `url(${app.customIconBase64})`;
        iconPreview.style.backgroundSize = 'cover';
        iconPreview.style.backgroundPosition = 'center';
        iconPreviewText.style.display = 'none';
        removeIconBtn.classList.remove('hidden');
    } else {
        iconPreview.style.backgroundImage = '';
        iconPreviewText.innerText = app.icon;
        iconPreviewText.style.display = 'block';
        iconPreview.style.background = app.lightGradient;
        removeIconBtn.classList.add('hidden');
    }
    
    // Set color
    const targetColor = app.lightGradient || PREDEFINED_COLORS[0];
    const radios = Array.from(document.querySelectorAll('input[name="app-color"]'));
    // targetColor might have different spacing due to JSON, so we just match substring or use the first
    const match = radios.find(r => r.value.replace(/\s/g,'') === targetColor.replace(/\s/g,'')) || radios[0];
    if (match) match.checked = true;
    
    modal.classList.remove('hidden'); modal.classList.add('flex');
}

function closeModal() {
    modal.classList.add('hidden'); modal.classList.remove('flex');
}

closeBtn.addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

form.addEventListener('submit', e => {
    e.preventDefault();
    const id = parseInt(inputId.value);
    const name = inputName.value;
    const color = document.querySelector('input[name="app-color"]:checked').value;
    
    const app = myApps.find(a => a.id === id);
    if (app) {
        app.name = name;
        const trimmedName = name.trim();
        if (trimmedName) {
            app.icon = [...trimmedName][0];
        }
        app.lightGradient = color;
        app.darkGradient = color; // For simplicity, we use same gradient
        
        const b64 = customIconBase64Input.value;
        if (b64) {
            app.customIconBase64 = b64;
        } else {
            delete app.customIconBase64;
        }
        
        saveApps();
        renderApps();
        initSortable();
    }
    closeModal();
    toggleEditMode(false); // Automatically exit edit mode after saving
});

function toggleEditMode(force) {
    const wasEditMode = isEditMode;
    isEditMode = force !== undefined ? force : !isEditMode;
    if (isEditMode) {
        appsGrid.classList.add('edit-mode');
        // Vibrate if supported
        if (navigator.vibrate) navigator.vibrate(50);
    } else {
        appsGrid.classList.remove('edit-mode');
    }
    
    // Update the delay parameter dynamically without destroying the instance
    if (wasEditMode !== isEditMode && sortableInstance) {
        // If we are turning ON edit mode from a long press, we are currently dragging!
        // Changing delay right now cancels the drag. So we defer it.
        if (isEditMode) {
            window.__pendingDelayUpdate = 0;
        } else {
            sortableInstance.option('delay', 800);
            window.__pendingDelayUpdate = null;
        }
    }
}

// Click anywhere on body to exit edit mode
document.body.addEventListener('click', (e) => {
    if (isEditMode && !e.target.closest('#appsGrid') && !e.target.closest('#app-modal')) {
        toggleEditMode(false);
    }
});



function renderApps() {
    appsGrid.innerHTML = '';
    const isDark = document.documentElement.classList.contains('dark');
    
    myApps.forEach((app, index) => {
        const appEl = document.createElement('a');
        appEl.className = 'app-icon animate-bloom flex flex-col items-center gap-2 cursor-pointer select-none relative [-webkit-touch-callout:none]';
        if (app.url) { 
            appEl.href = app.url + (app.url === 'duty.html' ? '?v=v2' : ''); 
        }
        // Add stagger delay for the bloom animation (e.g., 0.05s, 0.08s, 0.11s...)
        appEl.style.setProperty('--bloom-delay', `${0.05 + index * 0.03}s`);
        
        // Remove the bloom animation class after it completes so it doesn't re-trigger when exiting edit mode
        setTimeout(() => {
            appEl.classList.remove('animate-bloom');
        }, 1500);

        appEl.style.webkitUserSelect = 'none'; // Ensure user selection is fully disabled
        appEl.style.userSelect = 'none';
        appEl.style.webkitTouchCallout = 'none'; // Disable iOS long-press popup
        appEl.dataset.id = app.id;
        
        const badge = document.createElement('div');
        badge.className = 'edit-badge absolute cursor-pointer -top-1 -right-1 w-6 h-6 bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-full flex items-center justify-center shadow-md border border-slate-200 dark:border-slate-600';
        badge.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>';
        
        
        badge.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isEditMode) openModal(app);
        });
        // Prevent touch/mouse events from bubbling to appEl so it doesn't call preventDefault()
        const stopProp = (e) => e.stopPropagation();
        badge.addEventListener('mousedown', stopProp);
        badge.addEventListener('mouseup', stopProp);
        badge.addEventListener('touchstart', stopProp, {passive: false});
        badge.addEventListener('touchend', stopProp);

        
        
        const iconBtn = document.createElement('div');
        iconBtn.className = 'w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-[22%] app-icon-3d flex items-center justify-center text-[34px] sm:text-4xl text-white font-bold transition-transform active:scale-95 duration-200 bg-cover bg-center overflow-hidden';
        
        if (app.customIconBase64) {
            // Apply image to the background and remove text
            iconBtn.style.backgroundImage = `url(${app.customIconBase64})`;
            iconBtn.innerText = '';
        } else {
            // Fallback to gradient and emoji/text
            iconBtn.style.background = isDark ? (app.darkGradient || app.lightGradient) : app.lightGradient;
            iconBtn.innerText = app.icon;
        }

        
        const nameEl = document.createElement('span');
        nameEl.className = 'text-[13px] sm:text-sm font-medium tracking-wide drop-shadow-sm truncate w-full text-center px-1 mt-1';
        nameEl.innerText = app.name;
        
        // Force draggable false to completely kill HTML5 native drag on iOS/Desktop
        appEl.draggable = false;
        badge.draggable = false;
        iconBtn.draggable = false;
        nameEl.draggable = false;
        
        // Hide badge while dragging this specific item
        appEl.addEventListener('dragstart', (e) => e.preventDefault());

        appEl.appendChild(badge);
        appEl.appendChild(iconBtn);
        appEl.appendChild(nameEl);
        
        // Handle app opening with iOS-style launch animation
        appEl.addEventListener('click', (e) => {
            if (isEditMode) {
                e.preventDefault();
                return;
            }
            if (!app.url) return;

            e.preventDefault(); // Stop the native <a> tag from navigating instantly

            // 1. Icon bounce feedback
            iconBtn.style.transition = 'transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1)';
            iconBtn.style.transform = 'scale(0.85)';
            setTimeout(() => {
                iconBtn.style.transform = 'scale(1.08)';
                setTimeout(() => { iconBtn.style.transform = 'scale(1)'; }, 100);
            }, 100);

            // 2. Soft zoom-from-icon overlay that fades out as it expands
            const rect = iconBtn.getBoundingClientRect();
            const originX = ((rect.left + rect.width / 2) / window.innerWidth * 100).toFixed(2) + '%';
            const originY = ((rect.top + rect.height / 2) / window.innerHeight * 100).toFixed(2) + '%';
            const isDark = document.documentElement.classList.contains('dark');
            const bg = isDark ? (app.darkGradient || app.lightGradient) : app.lightGradient;

            const overlay = document.createElement('div');
            overlay.className = 'launch-overlay';
            overlay.style.cssText = `
                position: fixed; inset: 0; z-index: 99999;
                background: ${bg};
                transform-origin: ${originX} ${originY};
                transform: scale(0.1);
                border-radius: 50%;
                opacity: 1;
                pointer-events: none;
                overflow: hidden;
                transition: transform 0.32s cubic-bezier(0.32, 0, 0.15, 1),
                            border-radius 0.32s cubic-bezier(0.32, 0, 0.15, 1);
            `;
            
            // Add a wash layer to fade the vibrant gradient into a pastel color
            const wash = document.createElement('div');
            wash.style.cssText = `
                position: absolute; inset: 0;
                
                background: ${(() => {
                    let target = isDark ? '#020617' : '#f8fafc';
                    if (app.url === 'uob.html') target = '#0f172a';
                    else if (app.url === 'pharmadash.html') target = '#f1f5f9';
                    return target;
                })()};
                opacity: 0;
                transition: opacity 0.32s ease-out;
            `;
            overlay.appendChild(wash);
            
            document.body.appendChild(overlay);

            // Expand overlay and fade in the pastel wash
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    overlay.style.transform = 'scale(1)';
                    overlay.style.borderRadius = '32px';
                    wash.style.opacity = '0.8'; // Fades to 80% white/dark (pastel effect)
                });
            });

            // Navigate while overlay is fully covering screen — no flicker
            setTimeout(() => {
                const targetUrl = app.url + (app.url === 'duty.html' ? '?v=v2' : '');
                window.location.href = targetUrl;
            }, 300);

            
        });
        
        appsGrid.appendChild(appEl);
    });
}



function initSortable() {
    if (sortableInstance) sortableInstance.destroy();
    sortableInstance = new Sortable(appsGrid, {
        animation: 250,
        delay: isEditMode ? 0 : 800,
        delayOnTouchOnly: false,
        ghostClass: 'opacity-0',
        forceFallback: true,
        fallbackClass: 'opacity-100',
        fallbackOnBody: true,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        filter: '.edit-badge',
        preventOnFilter: false,
        onChoose: function (evt) {
            if (!isEditMode) {
                toggleEditMode(true);
            }
        },
        onUnchoose: function(evt) {
            if (window.__pendingDelayUpdate !== undefined && window.__pendingDelayUpdate !== null) {
                sortableInstance.option('delay', window.__pendingDelayUpdate);
                window.__pendingDelayUpdate = null;
            }
        },
        onEnd: function () {
            if (window.__pendingDelayUpdate !== undefined && window.__pendingDelayUpdate !== null) {
                sortableInstance.option('delay', window.__pendingDelayUpdate);
                window.__pendingDelayUpdate = null;
            }
            const newOrder = [];
            const children = appsGrid.children;
            for (let i = 0; i < children.length; i++) {
                const id = parseInt(children[i].dataset.id);
                const app = myApps.find(a => a.id === id);
                if (app) newOrder.push(app);
            }
            myApps = newOrder;
            saveApps();
            // Re-init sortable to update delays based on edit mode
            initSortable();
        }
    });
}



renderApps();
initSortable();

// Fix: When navigating back via browser Back button, iOS restores the page from
// bfcache (Back-Forward Cache) with the launch overlay still in the DOM.
// pageshow fires on every page restore — clean up any stuck overlays here.
window.addEventListener('pageshow', () => {
    document.querySelectorAll('.launch-overlay').forEach(el => el.remove());
});


// --- Google Auth (GSI) ---
const CLIENT_ID = '636153093113-figfghllvhd43j1ihlj3i8dog73r8kb9.apps.googleusercontent.com';
const AUTHORIZED_EMAIL = 'wisut.pond@gmail.com';
const lockScreen = document.getElementById('lockScreen');

const loginErrorMsg = document.getElementById('loginErrorMsg');

let tokenClient;

// Global function — called directly by onclick="handleLoginClick()" in HTML
// This guarantees the button always works regardless of JS load timing
function handleLoginClick() {
    loginErrorMsg.classList.add('hidden');
    if (tokenClient) {
        tokenClient.requestAccessToken();
    } else {
        loginErrorMsg.textContent = 'กำลังโหลด Google... รอสักครู่แล้วลองใหม่ครับ';
        loginErrorMsg.classList.remove('hidden');
    }
}

function setupGSIButton() {
    try {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive',
            callback: (response) => {
                if (response && response.access_token) {
                    handleToken(response);
                }
            },
            error_callback: (err) => {
                loginErrorMsg.textContent = 'OAuth Error: ' + JSON.stringify(err);
                loginErrorMsg.classList.remove('hidden');
                localStorage.removeItem('pond_ai_token');
            }
        });

        // Create button exactly like ponds-app — after tokenClient is ready
        const container = document.getElementById('google-btn-container');
        if (container) {
            container.innerHTML = '';
            const btn = document.createElement('button');
            btn.className = 'px-6 py-3 bg-white text-gray-800 font-medium rounded-full shadow-lg flex items-center gap-3 hover:bg-gray-100 transition-transform hover:scale-105 active:scale-95 mx-auto';
            btn.innerHTML = '<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="w-6 h-6"/> Sign in to Google Drive';
            btn.onclick = () => tokenClient.requestAccessToken();
            container.appendChild(btn);
        }
    } catch(e) {
        const container = document.getElementById('google-btn-container');
        if (container) container.innerHTML = '<p style="color:red;font-size:13px;text-align:center">Error: ' + e.message + '</p>';
    }
}

// Robust GSI init — works whether library is cached (fast) or slow
let _gsiReady = false;
function _tryInitGSI() {
    if (_gsiReady) return;
    if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
        _gsiReady = true; // set AFTER confirming google is ready, setupGSIButton has its own try-catch
        setupGSIButton();
    }
}

// Official GSI callback
window.onGoogleLibraryLoad = function() { _tryInitGSI(); };

// Polling fallback (handles cached/fast loads where onGoogleLibraryLoad may not fire)
let _gsiPollCount = 0;
const _gsiPoll = setInterval(function() {
    _gsiPollCount++;
    _tryInitGSI();
    if (_gsiReady || _gsiPollCount > 50) {
        clearInterval(_gsiPoll);
        if (!_gsiReady) {
            const container = document.getElementById('google-btn-container');
            if (container) container.innerHTML = '<p style="color:red;font-size:13px;text-align:center">Google Sign-In failed to load.<br>Try turning off content blockers.</p>';
        }
    }
}, 200);








async function validateUser(token) {
    try {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
            if (response.status === 401) {
                // Token expired. Do background silent refresh like ponds-app
                localStorage.removeItem('pond_ai_token');
                if (tokenClient) {
                    try { tokenClient.requestAccessToken({prompt: ''}); }
                    catch(e) { throw new Error('Silent refresh failed'); }
                } else {
                    throw new Error('Google Auth not initialized');
                }
                return; // Wait for silent refresh callback
            }
            throw new Error('Failed to fetch profile');
        }
        
        const data = await response.json();
        if (data.email === AUTHORIZED_EMAIL) {
            localStorage.setItem('pond_ai_token', token);
            localStorage.setItem('pond_ai_token_time', Date.now().toString());
            loadAppsFromCloud(token);
            lockScreen.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
            lockScreen.style.opacity = '0';
            lockScreen.style.transform = 'scale(1.05)';
            lockScreen.style.pointerEvents = 'none';
            setTimeout(() => lockScreen.classList.add('hidden'), 800);
            if (typeof settingsBtn !== "undefined" && settingsBtn) settingsBtn.classList.remove("hidden");
            loginErrorMsg.classList.add('hidden');
        } else {
            localStorage.removeItem('pond_ai_token');
            localStorage.removeItem('pond_ai_token_time');
            loginErrorMsg.textContent = 'Access Denied: Only the owner can log in.';
            loginErrorMsg.classList.remove('hidden');
            lockScreen.classList.remove('hidden');
            lockScreen.style.opacity = '1';
            lockScreen.style.pointerEvents = 'auto';
        }
    } catch (error) {
        localStorage.removeItem('pond_ai_token');
        localStorage.removeItem('pond_ai_token_time');
        loginErrorMsg.textContent = 'Auth failed: ' + error.message;
        loginErrorMsg.classList.remove('hidden');
        lockScreen.classList.remove('hidden');
        lockScreen.style.opacity = '1';
        lockScreen.style.pointerEvents = 'auto';
    }
}

function handleToken(response) {
    if (response.error !== undefined) {
        loginErrorMsg.textContent = 'Auth failed: ' + (response.error || 'Unknown error');
        loginErrorMsg.classList.remove('hidden');
        return;
    }
    loginErrorMsg.classList.add('hidden');
    validateUser(response.access_token);
}

// Check saved token immediately
const savedToken = localStorage.getItem('pond_ai_token');
const savedTokenTime = localStorage.getItem('pond_ai_token_time');
const isExpired = savedTokenTime ? (Date.now() - parseInt(savedTokenTime) > 55 * 60 * 1000) : false;

if (savedToken && !isExpired) {
    loadAppsFromCloud(savedToken);
    lockScreen.style.transition = 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    lockScreen.style.opacity = '0';
    lockScreen.style.pointerEvents = 'none';
    setTimeout(() => lockScreen.classList.add('hidden'), 500);
    if (typeof settingsBtn !== "undefined" && settingsBtn) settingsBtn.classList.remove("hidden");
} else if (savedToken && isExpired) {
    localStorage.removeItem('pond_ai_token');
    localStorage.removeItem('pond_ai_token_time');
    // Lock screen remains visible
}

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('expired') === '1') {
    loginErrorMsg.textContent = 'เซสชันหมดอายุแล้ว กรุณาล็อกอินใหม่อีกครั้ง';
    loginErrorMsg.classList.remove('hidden');
    window.history.replaceState(null, '', window.location.pathname);
}




// Auto-inject PharmaDash if missing from user's saved apps
(function() {
    const saved = localStorage.getItem('pond_myApps');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && !parsed.some(a => a.id === 6)) {
                parsed.push({ id: 6, name: 'Pharma', url: 'pharmadash.html', lightGradient: 'linear-gradient(135deg, #a78bfa, #818cf8)', darkGradient: 'linear-gradient(135deg, #7c3aed, #6366f1)', icon: 'P' });
                localStorage.setItem('pond_myApps', JSON.stringify(parsed));
            }
        } catch(e) {}
    }
})();



// --- PWA OAUTH REDIRECT HANDLER ---

