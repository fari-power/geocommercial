import multer from 'multer';
import path from 'path';

// Use memory storage so the buffer can be uploaded to Cloudinary
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Format d\'image non supporté (JPG, PNG, WEBP uniquement)'));
        }
    }
});

export default upload;
