import axios from 'axios';

async function test() {
    try {
        const response = await axios.get('http://localhost:3001/api/points');
        console.log('Status:', response.status);
        console.log('Total:', response.data.total);
        console.log('Rows:', response.data.data?.length || 0);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

test();
