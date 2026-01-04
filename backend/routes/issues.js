const express = require('express');
const router = express.Router();
const Joi = require('joi');
const Issue = require('../models/Issue');
const { verifyToken, requireRole, requireMinRole } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

// Validation schema
const createIssueSchema = Joi.object({
    title: Joi.string().min(5).max(500).required(),
    description: Joi.string().min(10).required(),
    category_id: Joi.number().integer().required(),
    area_id: Joi.number().integer().required(),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
});

const updateIssueSchema = Joi.object({
    title: Joi.string().min(5).max(500).optional(),
    description: Joi.string().min(10).optional(),
    category_id: Joi.number().integer().optional(),
    area_id: Joi.number().integer().optional(),
    status: Joi.string().valid('NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED').optional(),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional(),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
});

// POST /api/issues - Create new issue
router.post('/', verifyToken, upload.array('images', 5), handleUploadError, async (req, res) => {
    try {
        // Validate input
        const { error, value } = createIssueSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        const { title, description, category_id, area_id, latitude, longitude } = value;

        // Get uploaded image paths
        const images = req.files ? req.files.map(file => file.path) : [];

        // Create issue
        const issue = await Issue.create({
            title,
            description,
            category_id,
            area_id,
            user_id: req.user.id,
            latitude,
            longitude,
            images,
        });

        res.status(201).json({
            success: true,
            message: 'Issue created successfully',
            data: issue,
        });
    } catch (error) {
        console.error('Create issue error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating issue',
        });
    }
});

// GET /api/issues - Get all issues with filters
router.get('/', verifyToken, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            category_id,
            area_id,
            priority,
            start_date,
            end_date,
            search,
        } = req.query;

        const filters = {
            page: parseInt(page),
            limit: Math.min(parseInt(limit), 100),
            status,
            category_id: category_id ? parseInt(category_id) : null,
            area_id: area_id ? parseInt(area_id) : null,
            priority,
            start_date,
            end_date,
            search,
        };

        // If user is CITIZEN, only show their issues
        if (req.user.role === 'CITIZEN') {
            filters.user_id = req.user.id;
        }

        // If user is COORDINATOR, only show issues in their assigned areas
        // (This would require additional logic to get assigned areas)

        const result = await Issue.findAll(filters);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('Get issues error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching issues',
        });
    }
});

// GET /api/issues/:id - Get issue by ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const issue = await Issue.findById(id);

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: 'Issue not found',
            });
        }

        // Check permissions
        if (req.user.role === 'CITIZEN' && issue.user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            });
        }

        res.json({
            success: true,
            data: issue,
        });
    } catch (error) {
        console.error('Get issue error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching issue',
        });
    }
});

// PUT /api/issues/:id - Update issue
router.put('/:id', verifyToken, requireMinRole('COORDINATOR'), async (req, res) => {
    try {
        const { id } = req.params;

        // Validate input
        const { error, value } = updateIssueSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        // Check if issue exists
        const existingIssue = await Issue.findById(id);
        if (!existingIssue) {
            return res.status(404).json({
                success: false,
                message: 'Issue not found',
            });
        }

        // Update issue
        const updatedIssue = await Issue.update(id, value);

        res.json({
            success: true,
            message: 'Issue updated successfully',
            data: updatedIssue,
        });
    } catch (error) {
        console.error('Update issue error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating issue',
        });
    }
});

// POST /api/issues/:id/status - Update issue status with comment
router.post('/:id/status', verifyToken, requireMinRole('COORDINATOR'), async (req, res) => {
    try {
        const { id } = req.params;
        const { status, comment } = req.body;

        if (!status || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Status and comment are required',
            });
        }

        const validStatuses = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status',
            });
        }

        // Check if issue exists
        const existingIssue = await Issue.findById(id);
        if (!existingIssue) {
            return res.status(404).json({
                success: false,
                message: 'Issue not found',
            });
        }

        // Update status
        const updatedIssue = await Issue.updateStatus(id, req.user.id, status, comment);

        res.json({
            success: true,
            message: 'Status updated successfully',
            data: updatedIssue,
        });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating status',
        });
    }
});

// POST /api/issues/:id/comment - Add comment to issue
router.post('/:id/comment', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;

        if (!comment) {
            return res.status(400).json({
                success: false,
                message: 'Comment is required',
            });
        }

        // Check if issue exists
        const existingIssue = await Issue.findById(id);
        if (!existingIssue) {
            return res.status(404).json({
                success: false,
                message: 'Issue not found',
            });
        }

        // Add comment
        const update = await Issue.addUpdate(id, req.user.id, comment);

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: update,
        });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while adding comment',
        });
    }
});

// DELETE /api/issues/:id - Delete issue
router.delete('/:id', verifyToken, requireRole('ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;

        // Check if issue exists
        const existingIssue = await Issue.findById(id);
        if (!existingIssue) {
            return res.status(404).json({
                success: false,
                message: 'Issue not found',
            });
        }

        // Delete issue
        await Issue.delete(id);

        res.json({
            success: true,
            message: 'Issue deleted successfully',
        });
    } catch (error) {
        console.error('Delete issue error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting issue',
        });
    }
});

// GET /api/issues/stats/overview - Get issue statistics
router.get('/stats/overview', verifyToken, requireMinRole('COORDINATOR'), async (req, res) => {
    try {
        const { start_date, end_date, area_id } = req.query;

        const stats = await Issue.getStatistics({
            start_date,
            end_date,
            area_id: area_id ? parseInt(area_id) : null,
        });

        res.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching statistics',
        });
    }
});

module.exports = router;
