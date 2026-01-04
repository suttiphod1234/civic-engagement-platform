const express = require('express');
const router = express.Router();
const Joi = require('joi');
const Area = require('../models/Area');
const User = require('../models/User');
const { verifyToken, requireRole } = require('../middleware/auth');

// Validation schema
const areaSchema = Joi.object({
    name_th: Joi.string().required(),
    name_en: Joi.string().required(),
    province: Joi.string().required(),
    district: Joi.string().optional(),
    subdistrict: Joi.string().optional(),
    postal_code: Joi.string().pattern(/^[0-9]{5}$/).optional(),
});

// GET /api/areas - Get all areas
router.get('/', async (req, res) => {
    try {
        const { active_only = 'true', province } = req.query;
        const areas = await Area.findAll({
            active_only: active_only === 'true',
            province
        });

        res.json({
            success: true,
            data: areas,
        });
    } catch (error) {
        console.error('Get areas error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching areas',
        });
    }
});

// GET /api/areas/provinces - Get all provinces
router.get('/provinces', async (req, res) => {
    try {
        const provinces = await Area.getProvinces();

        res.json({
            success: true,
            data: provinces,
        });
    } catch (error) {
        console.error('Get provinces error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching provinces',
        });
    }
});

// GET /api/areas/:id - Get area by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const area = await Area.findById(id);

        if (!area) {
            return res.status(404).json({
                success: false,
                message: 'Area not found',
            });
        }

        res.json({
            success: true,
            data: area,
        });
    } catch (error) {
        console.error('Get area error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching area',
        });
    }
});

// GET /api/areas/:id/coordinators - Get coordinators assigned to area
router.get('/:id/coordinators', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const coordinators = await Area.getCoordinators(id);

        res.json({
            success: true,
            data: coordinators,
        });
    } catch (error) {
        console.error('Get coordinators error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching coordinators',
        });
    }
});

// GET /api/areas/stats/all - Get area statistics
router.get('/stats/all', verifyToken, async (req, res) => {
    try {
        const stats = await Area.getStatistics();

        res.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        console.error('Get area stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching statistics',
        });
    }
});

// POST /api/areas - Create new area (ADMIN only)
router.post('/', verifyToken, requireRole('ADMIN'), async (req, res) => {
    try {
        const { error, value } = areaSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        const area = await Area.create(value);

        res.status(201).json({
            success: true,
            message: 'Area created successfully',
            data: area,
        });
    } catch (error) {
        console.error('Create area error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating area',
        });
    }
});

// PUT /api/areas/:id - Update area (ADMIN only)
router.put('/:id', verifyToken, requireRole('ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = areaSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        const area = await Area.update(id, value);

        res.json({
            success: true,
            message: 'Area updated successfully',
            data: area,
        });
    } catch (error) {
        console.error('Update area error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating area',
        });
    }
});

// DELETE /api/areas/:id - Delete area (ADMIN only)
router.delete('/:id', verifyToken, requireRole('ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        await Area.delete(id);

        res.json({
            success: true,
            message: 'Area deleted successfully',
        });
    } catch (error) {
        console.error('Delete area error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting area',
        });
    }
});

// POST /api/areas/:id/assign - Assign coordinator to area (ADMIN only)
router.post('/:id/assign', verifyToken, requireRole('ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required',
            });
        }

        // Verify user exists and is a coordinator
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        if (user.role !== 'COORDINATOR') {
            return res.status(400).json({
                success: false,
                message: 'User must be a coordinator',
            });
        }

        // Assign to area
        await User.assignToArea(user_id, id);

        res.json({
            success: true,
            message: 'Coordinator assigned to area successfully',
        });
    } catch (error) {
        console.error('Assign coordinator error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while assigning coordinator',
        });
    }
});

// DELETE /api/areas/:id/assign/:userId - Remove coordinator from area (ADMIN only)
router.delete('/:id/assign/:userId', verifyToken, requireRole('ADMIN'), async (req, res) => {
    try {
        const { id, userId } = req.params;

        await User.removeFromArea(userId, id);

        res.json({
            success: true,
            message: 'Coordinator removed from area successfully',
        });
    } catch (error) {
        console.error('Remove coordinator error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while removing coordinator',
        });
    }
});

module.exports = router;
