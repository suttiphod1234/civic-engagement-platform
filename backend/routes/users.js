const express = require('express');
const router = express.Router();
const Joi = require('joi');
const User = require('../models/User');
const { verifyToken, requireRole } = require('../middleware/auth');

// Validation schema
const updateUserSchema = Joi.object({
    full_name: Joi.string().optional(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
    role: Joi.string().valid('CITIZEN', 'COORDINATOR', 'ADMIN').optional(),
    is_active: Joi.boolean().optional(),
});

// GET /api/users - Get all users (ADMIN only)
router.get('/', verifyToken, requireRole('ADMIN'), async (req, res) => {
    try {
        const { page = 1, limit = 20, role } = req.query;

        const result = await User.findAll({
            page: parseInt(page),
            limit: Math.min(parseInt(limit), 100),
            role,
        });

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching users',
        });
    }
});

// GET /api/users/:id - Get user by ID (ADMIN only)
router.get('/:id', verifyToken, requireRole('ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Get assigned areas if coordinator
        let assignedAreas = [];
        if (user.role === 'COORDINATOR') {
            assignedAreas = await User.getAssignedAreas(id);
        }

        res.json({
            success: true,
            data: {
                ...user,
                assignedAreas,
            },
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching user',
        });
    }
});

// PUT /api/users/:id - Update user (ADMIN only)
router.put('/:id', verifyToken, requireRole('ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;

        const { error, value } = updateUserSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        // Check if user exists
        const existingUser = await User.findById(id);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Update user
        const updatedUser = await User.update(id, value);

        res.json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser,
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating user',
        });
    }
});

// PUT /api/users/:id/role - Change user role (ADMIN only)
router.put('/:id/role', verifyToken, requireRole('ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const validRoles = ['CITIZEN', 'COORDINATOR', 'ADMIN'];
        if (!role || !validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Valid role is required (CITIZEN, COORDINATOR, or ADMIN)',
            });
        }

        // Check if user exists
        const existingUser = await User.findById(id);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Prevent changing own role
        if (parseInt(id) === req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Cannot change your own role',
            });
        }

        // Update role
        const updatedUser = await User.update(id, { role });

        res.json({
            success: true,
            message: 'User role updated successfully',
            data: updatedUser,
        });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating role',
        });
    }
});

// DELETE /api/users/:id - Delete user (ADMIN only)
router.delete('/:id', verifyToken, requireRole('ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const existingUser = await User.findById(id);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Prevent deleting own account
        if (parseInt(id) === req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete your own account',
            });
        }

        // Soft delete user
        await User.delete(id);

        res.json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting user',
        });
    }
});

// POST /api/users/:id/assign-area - Assign coordinator to area (ADMIN only)
router.post('/:id/assign-area', verifyToken, requireRole('ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        const { area_id } = req.body;

        if (!area_id) {
            return res.status(400).json({
                success: false,
                message: 'Area ID is required',
            });
        }

        // Check if user exists and is a coordinator
        const user = await User.findById(id);
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
        await User.assignToArea(id, area_id);

        res.json({
            success: true,
            message: 'Coordinator assigned to area successfully',
        });
    } catch (error) {
        console.error('Assign area error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while assigning area',
        });
    }
});

// DELETE /api/users/:id/assign-area/:areaId - Remove coordinator from area (ADMIN only)
router.delete('/:id/assign-area/:areaId', verifyToken, requireRole('ADMIN'), async (req, res) => {
    try {
        const { id, areaId } = req.params;

        await User.removeFromArea(id, areaId);

        res.json({
            success: true,
            message: 'Coordinator removed from area successfully',
        });
    } catch (error) {
        console.error('Remove area error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while removing area assignment',
        });
    }
});

// GET /api/users/:id/areas - Get user's assigned areas
router.get('/:id/areas', verifyToken, requireRole('ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;

        const areas = await User.getAssignedAreas(id);

        res.json({
            success: true,
            data: areas,
        });
    } catch (error) {
        console.error('Get user areas error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching user areas',
        });
    }
});

module.exports = router;
