const url = 'https://script.google.com/macros/s/AKfycbxWpgNAYLkjIWtGUhDpR41JBw6iHmQMvP0soutqg7RqEmfzhnzLjVDbvmSLbGV3048k/exec';

const payload = {
    url: 'https://www.googleapis.com/drive/v3/files?pageSize=1',
    method: 'GET',
    headers: {}
};

fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
})
.then(res => res.json())
.then(data => console.log('Success:', data))
.catch(err => console.error('Error:', err));
