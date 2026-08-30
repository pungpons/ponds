const url = 'https://script.google.com/macros/s/AKfycbxWpgNAYLkjIWtGUhDpR41JBw6iHmQMvP0soutqg7RqEmfzhnzLjVDbvmSLbGV3048k/exec';

const payload = {
    url: 'https://sheets.googleapis.com/v4/spreadsheets/1h7x.../values/A1',
    method: 'GET',
    headers: {}
};

fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
})
.then(res => res.json())
.then(data => console.log('Sheets API Response:', data.status, data.body.substring(0, 200)))
.catch(err => console.error('Error:', err));
