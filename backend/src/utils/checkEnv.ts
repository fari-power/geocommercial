import dotenv from 'dotenv';
dotenv.config();
console.log('--- DIAGNOSTIC DES CLÉS ---');
console.log('MISTRAL_API_KEY présente :', process.env.MISTRAL_API_KEY ? 'OUI' : 'NON');
if (process.env.MISTRAL_API_KEY) {
    console.log('Début de la clé :', process.env.MISTRAL_API_KEY.substring(0, 4) + '...');
}
console.log('---------------------------');
