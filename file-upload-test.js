/**
 * Simple file upload server for testing
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create Express app
const app = express();
const port = 3001; // Using a different port to avoid conflicts

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// Set up multer
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadDir));

// Simple welcome route
app.get('/', (req, res) => {
    res.send(`
        <h1>File Upload Test Server</h1>
        <p>Use Postman to test the following endpoints:</p>
        <ul>
            <li><b>POST /api/upload</b> - Upload a single file (field name: "file")</li>
            <li><b>POST /api/upload-multiple</b> - Upload multiple files (field name: "files", max 5)</li>
            <li><b>GET /api/files</b> - List all uploaded files</li>
        </ul>
    `);
});

// Upload a single file
app.post('/api/upload', upload.single('file'), (req, res) => {
    console.log('Upload request received');
    console.log('Headers:', req.headers);
    
    try {
        if (!req.file) {
            console.log('No file received');
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        
        console.log('File received:', req.file);
        
        return res.status(201).json({ 
            success: true, 
            message: 'File uploaded successfully',
            file: {
                filename: req.file.filename,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                path: req.file.path
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ success: false, message: 'Server error during upload', error: error.message });
    }
});

// Also support the path from Postman
app.post('/api/files/upload', upload.single('file'), (req, res) => {
    console.log('Upload request received on /api/files/upload');
    console.log('Headers:', req.headers);
    
    try {
        if (!req.file) {
            console.log('No file received');
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        
        console.log('File received:', req.file);
        
        return res.status(201).json({ 
            success: true, 
            message: 'File uploaded successfully',
            file: {
                filename: req.file.filename,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                path: req.file.path
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ success: false, message: 'Server error during upload', error: error.message });
    }
});
    
    try {
        if (!req.file) {
            console.log('No file received');
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        
        console.log('File received:', req.file);
        
        return res.status(201).json({ 
            success: true, 
            message: 'File uploaded successfully',
            file: {
                filename: req.file.filename,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                path: req.file.path
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ success: false, message: 'Server error during upload', error: error.message });
    }
});

// Upload multiple files
app.post('/api/upload-multiple', upload.array('files', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }
        
        const fileDetails = req.files.map(file => ({
            filename: file.filename,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: file.path
        }));
        
        return res.status(201).json({ 
            success: true, 
            message: `${req.files.length} files uploaded successfully`,
            files: fileDetails
        });
    } catch (error) {
        console.error('Multiple upload error:', error);
        return res.status(500).json({ success: false, message: 'Server error during upload', error: error.message });
    }
});

// Get list of files
app.get('/api/files', (req, res) => {
    try {
        fs.readdir(uploadDir, (err, files) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error reading directory', error: err.message });
            }
            
            const fileDetails = files
                .filter(file => !fs.statSync(path.join(uploadDir, file)).isDirectory())
                .map(file => {
                    const stats = fs.statSync(path.join(uploadDir, file));
                    return {
                        name: file,
                        size: stats.size,
                        lastModified: stats.mtime
                    };
                });
            
            res.json({ success: true, files: fileDetails });
        });
    } catch (error) {
        console.error('Error listing files:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// Error handling for file uploads
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, message: 'File size exceeds the 10MB limit' });
        }
        return res.status(400).json({ success: false, message: err.message });
    }
    
    res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

// Start the server
app.listen(port, () => {
    console.log(`File upload test server running at http://localhost:${port}`);
    console.log(`Upload directory: ${uploadDir}`);
});
