const path = require('path');
const fs = require('fs');
const database = require('../Database/database');

class FileController {
    constructor() {
        this.insertFileQuery = `
            INSERT INTO files (user_id, filename, originalname, path, mimetype, size)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        this.getFileByIdQuery = `
            SELECT * FROM files WHERE id = ?
        `;
        this.getFilesByUserIdQuery = `
            SELECT id, originalname, mimetype, size, created_at FROM files WHERE user_id = ?
        `;
        this.deleteFileQuery = `
            DELETE FROM files WHERE id = ?
        `;
    }
    
    async uploadFile(req, res) {
        try {
            console.log('FileController: uploadFile method called');
            console.log('Request body:', req.body);
            console.log('Request headers:', req.headers);
            
            if (!req.file) {
                console.log('No file found in request');
                return res.status(400).json({
                    success: false,
                    error: 'No file uploaded'
                });
            }
            
            console.log('File details:', req.file);
            
            const { filename, originalname, path: absolutePath, mimetype, size } = req.file;
            const userId = req.user?.id;
            console.log('User ID:', userId);
            
            try {
                const projectRoot = path.resolve(__dirname, '..');
                let relativePath = path.relative(projectRoot, absolutePath);
                relativePath = relativePath.replace(/\\/g, '/');
                console.log('Relative path:', relativePath);
            } catch (error) {
                console.error('Error converting path:', error.message);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to process file path'
                });
            }
            await database.connect();
            
            await database.query(
                this.insertFileQuery, 
                [userId, filename, originalname, relativePath, mimetype, size]
            );
            
            return res.status(201).json({
                success: true,
                message: 'File uploaded successfully',
                file: {
                    filename,
                    originalname,
                    mimetype,
                    size
                }
            });
        } catch (error) {
            console.error('Error uploading file:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to upload file',
                details: error.message
            });
        }
    }
    
    async getFile(req, res) {
        try {
            const fileId = req.params.id;
            if (!fileId) {
                return res.status(400).json({
                    success: false,
                    error: 'File ID is required'
                });
            }
            
            await database.connect();
            
            const result = await database.query(this.getFileByIdQuery, [fileId]);
            
            if (!result || result.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'File not found'
                });
            }
            
            const file = result[0];
            
            const projectRoot = path.resolve(__dirname, '..');
            const absolutePath = path.join(projectRoot, file.path);
            console.log('Converting relative path to absolute:', file.path, '->', absolutePath);
            
            if (!fs.existsSync(absolutePath)) {
                return res.status(404).json({
                    success: false,
                    error: 'File not found on disk'
                });
            }
            
            res.setHeader('Content-Type', file.mimetype);
            res.setHeader('Content-Disposition', `inline; filename="${file.originalname}"`);
            
            const fileStream = fs.createReadStream(absolutePath);
            fileStream.pipe(res);
            
        } catch (error) {
            console.error('Error retrieving file:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to retrieve file',
                details: error.message
            });
        }
    }
    
    async getUserFiles(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }
            
            await database.connect();
            
            const files = await database.query(this.getFilesByUserIdQuery, [userId]);
            
            return res.status(200).json({
                success: true,
                files
            });
        } catch (error) {
            console.error('Error getting user files:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to retrieve files',
                details: error.message
            });
        }
    }
    
    async deleteFile(req, res) {
        try {
            const fileId = req.params.id;
            const userId = req.user?.id;
            
            if (!fileId) {
                return res.status(400).json({
                    success: false,
                    error: 'File ID is required'
                });
            }
            
            await database.connect();
            
            const result = await database.query(this.getFileByIdQuery, [fileId]);
            
            if (!result || result.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'File not found'
                });
            }
            
            const file = result[0];
            
            if (file.user_id !== userId && req.user?.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    error: 'You do not have permission to delete this file'
                });
            }
            
            await database.query(this.deleteFileQuery, [fileId]);
            
            const projectRoot = path.resolve(__dirname, '..');
            const absolutePath = path.join(projectRoot, file.path);
            console.log('Converting relative path to absolute for deletion:', file.path, '->', absolutePath);
            
            if (fs.existsSync(absolutePath)) {
                fs.unlinkSync(absolutePath);
            }
            
            return res.status(200).json({
                success: true,
                message: 'File deleted successfully'
            });
            
        } catch (error) {
            console.error('Error deleting file:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to delete file',
                details: error.message
            });
        }
    }
    
    async saveFileToDatabase(userId, filename, originalname, absolutePath, mimetype, size) {
        await database.connect();
        
        const projectRoot = path.resolve(__dirname, '..');
        let relativePath = path.relative(projectRoot, absolutePath);
        relativePath = relativePath.replace(/\\/g, '/');
        console.log('Saving file with relative path:', relativePath);
        
        const result = await database.query(
            this.insertFileQuery, 
            [userId, filename, originalname, relativePath, mimetype, size]
        );
        
        return result;
    }
}

module.exports = FileController;
