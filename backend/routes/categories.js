const express = require('express');
const router = express.Router();
const Joi = require('joi');
const Category = require('../models/Category');
const { verifyToken, requireRole } = require('../middleware/auth');

// Validation schema
const categorySchema = Joi.object({
    name_th: Joi.string().required(),
    name_en: Joi.string().required(),
    description: Joi.string().optional(),
    icon: Joi.string().optional(),
});

// GET /api/categories - Get all categories
router.get('/', async (req, res) => {
    try {
        const { active_only = 'true' } = req.query;
        const categories = await Category.findAll({
            active_only: active_only === 'true'
        });

        res.json({
            success: true,
            data: categories,
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching categories',
        });
    }
});

// GET /api/categories/:id - Get category by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found',
            });
        }

        res.json({
            success: true,
            data: category,
        });
    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching category',
        });
    }
});

// GET /api/categories/stats/all - Get category statistics
router.get('/stats/all', verifyToken, async (req, res) => {
    try {
        const stats = await Category.getStatistics();

        res.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        console.error('Get category stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching statistics',
        });
    }
});

// POST /api/categories - Create new category (ADMIN only)
router.post('/', verifyToken, requireRole('ADMIN'), async (req, res) => {
    try {
        const { error, value } = categorySchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        const category = await Category.create(value);

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category,
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating category',
        });
    }
});

// PUT /api/categories/:id - Update category (ADMIN only)
router.put('/:id', verifyToken, requireRole('ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = categorySchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        const category = await Category.update(id, value);

        res.json({
            success: true,
            message: 'Category updated successfully',
            data: category,
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating category',
        });
    }
});

// DELETE /api/categories/:id - Delete category (ADMIN only)
router.delete('/:id', verifyToken, requireRole('ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        await Category.delete(id);

        res.json({
            success: true,
            message: 'Category deleted successfully',
        });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting category',
        });
    }
});

module.exports = router;
