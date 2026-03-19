import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dzbgljbws',
    api_key: process.env.CLOUDINARY_API_KEY || '888575124213475',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'SbPVVtTQMik1TBWqOBW8PdXtmNQ',
    secure: true,
});

export default cloudinary;
