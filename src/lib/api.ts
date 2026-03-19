import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    headers: {
        'X-API-KEY': 'geocommercial_2026_access_secure_key' // Clé de connexion
    }
});

export default api;
