const fs = require('fs');
const path = require('path');

const oldDir = path.join(__dirname, 'backend', 'uploads', 'Images applications');
const newDir = path.join(__dirname, 'backend', 'uploads', 'images_app');

if (fs.existsSync(oldDir)) {
    try {
        fs.renameSync(oldDir, newDir);
        console.log('SUCCESS: Renamed to images_app');
    } catch (e) {
        console.error('RENAME_FAILED:', e.message);
    }
} else if (fs.existsSync(newDir)) {
    console.log('ALREADY_DONE: images_app exists');
} else {
    console.log('ERROR: Neither folder found');
}
