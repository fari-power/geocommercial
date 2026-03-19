const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/points/reassign-images',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': 'geocommercial_2026_access_secure_key'
    }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Response:', data);
        process.exit(0);
    });
});

req.on('error', (e) => {
    console.error('Error calling API (is the server running?):', e.message);
    process.exit(1);
});

req.end();
