/**
 * Middleware for handling file uploads
 */
const multer = require('multer');
const path = require('path');
const fs = require('fs');

console.log('Initializing file upload middleware');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
console.log('Upload directory path:', uploadDir);
if (!fs.existsSync(uploadDir)) {
    console.log('Creating upload directory');
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Store files in uploads directory by type
        let targetDir = uploadDir;
        
        // Organize files into subdirectories based on type
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
            targetDir = path.join(uploadDir, 'images');
        } else if (file.mimetype === 'application/pdf') {
            targetDir = path.join(uploadDir, 'documents');
        }
        
        // Create the directory if it doesn't exist
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        
        cb(null, targetDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File filter to control allowed file types
const fileFilter = (req, file, cb) => {
    // Only accept JPG, PNG and PDF files
    if (file.mimetype === 'image/jpeg' || 
        file.mimetype === 'image/jpg' || 
        file.mimetype === 'image/png' || 
        file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only JPG, PNG, and PDF files are allowed'), false);
    }
};

// Create the multer instance with options
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    }
});

// Error handler for file upload errors
const handleUploadError = (err, req, res, next) => {
    console.log('In upload error handler');
    if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading
        console.error('Multer error:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File size exceeds the 5MB limit'
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                error: 'Unexpected field name. Use "file" for single uploads or "files" for multiple uploads.'
            });
        }
        return res.status(400).json({
            success: false,
            error: err.message
        });
    } else if (err) {
        // An unknown error occurred
        console.error('Upload error:', err);
        if (err.message.includes('Only JPG, PNG, and PDF')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid file type. Only JPG, PNG, and PDF files are allowed.'
            });
        }
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }
    console.log('No upload errors detected');
    next();
};

module.exports = {
    upload,
    handleUploadError
};
