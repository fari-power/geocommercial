const http = require('http');

const url = 'http://localhost:3001/uploads/Images%20applications/KFC.png';

http.get(url, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    if (res.statusCode === 200) {
        console.log('Success! File is reachable.');
    } else {
        console.log('Failed to reach file.');
    }
    process.exit(0);
}).on('error', (e) => {
    console.error(`Error: ${e.message}`);
    process.exit(1);
});
