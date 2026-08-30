const url = 'https://script.google.com/macros/s/AKfycbxWpgNAYLkjIWtGUhDpR41JBw6iHmQMvP0soutqg7RqEmfzhnzLjVDbvmSLbGV3048k/exec';

const payload = {
    url: 'https://www.googleapis.com/drive/v3/files?q=' + encodeURIComponent("name='pond_ai_config.json' and trashed=false"),
    method: 'GET',
    headers: {}
};

fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
})
.then(res => res.json())
.then(data => {
    const body = JSON.parse(data.body);
    console.log('Search config:', body.files);
    if (body.files && body.files.length > 0) {
        const id = body.files[0].id;
        const p2 = {
            url: `https://www.googleapis.com/drive/v3/files/${id}?alt=media`,
            method: 'GET',
            headers: {}
        };
        return fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(p2)
        });
    }
})
.then(res => res ? res.json() : null)
.then(data => {
    if (data) {
        console.log('Config content:', data.body);
    }
})
.catch(err => console.error('Error:', err));
