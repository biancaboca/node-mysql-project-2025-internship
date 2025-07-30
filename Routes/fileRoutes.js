/**
 * Routes for file upload and management
 */
const express = require('express');
const FileController = require('../Controller/fileController');
const { verifyToken, authorizeRoles } = require('../Middleware/authMiddleware');
const { upload, handleUploadError } = require('../Middleware/fileUploadMiddleware');
const ValidationMiddleware = require('../Middleware/validationMiddleware');
const { idParamSchema } = require('../Validation/userValidation');

class FileRoutes {
    constructor() {
        this.router = express.Router();
        this.fileController = new FileController();
        this.initializeRoutes();
    }

    initializeRoutes() {
        // Upload file - requires authentication
        this.router.post(
            '/upload',
            verifyToken,
            upload.single('file'), // 'file' is the field name in the form
            handleUploadError,
            this.uploadFile.bind(this)
        );

        // Upload multiple files - requires authentication
        this.router.post(
            '/upload-multiple',
            verifyToken,
            upload.array('files', 5), // max 5 files
            handleUploadError,
            this.uploadMultipleFiles.bind(this)
        );

        // Get file by id - requires authentication
        this.router.get(
            '/:id',
            verifyToken,
            ValidationMiddleware.validateParams(idParamSchema),
            this.getFile.bind(this)
        );

        // Get all user files - requires authentication
        this.router.get(
            '/',
            verifyToken,
            this.getUserFiles.bind(this)
        );

        // Delete file - requires authentication
        this.router.delete(
            '/:id',
            verifyToken,
            ValidationMiddleware.validateParams(idParamSchema),
            this.deleteFile.bind(this)
        );
    }

    async uploadFile(req, res) {
        console.log('FileRoutes: uploadFile method called');
        console.log('Request file:', req.file);
        console.log('Request user:', req.user);
        return this.fileController.uploadFile(req, res);
    }

    async uploadMultipleFiles(req, res) {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No files uploaded'
                });
            }
            
            // Process each file
            const filePromises = req.files.map(async (file) => {
                const userId = req.user?.id;
                const { filename, originalname, path: filePath, mimetype, size } = file;
                
                await this.fileController.saveFileToDatabase(userId, filename, originalname, filePath, mimetype, size);
                
                return {
                    filename,
                    originalname,
                    mimetype,
                    size
                };
            });
            
            // Wait for all files to be processed
            const uploadedFiles = await Promise.all(filePromises);
            
            return res.status(201).json({
                success: true,
                message: `${uploadedFiles.length} files uploaded successfully`,
                files: uploadedFiles
            });
        } catch (error) {
            console.error('Error uploading multiple files:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to upload files',
                details: error.message
            });
        }
    }

    async getFile(req, res) {
        return this.fileController.getFile(req, res);
    }

    async getUserFiles(req, res) {
        return this.fileController.getUserFiles(req, res);
    }

    async deleteFile(req, res) {
        return this.fileController.deleteFile(req, res);
    }
}

module.exports = FileRoutes;
