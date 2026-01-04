const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');
const authConfig = require('../config/auth');
const { verifyToken } = require('../middleware/auth');

// Validation schemas
const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    full_name: Joi.string().required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

// Generate tokens
const generateTokens = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
    };

    const accessToken = jwt.sign(payload, authConfig.jwtSecret, {
        expiresIn: authConfig.jwtExpire,
    });

    const refreshToken = jwt.sign(payload, authConfig.jwtRefreshSecret, {
        expiresIn: authConfig.jwtRefreshExpire,
    });

    return { accessToken, refreshToken };
};

// POST /api/auth/register - Register new user
router.post('/register', async (req, res) => {
    try {
        // Validate input
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        const { email, password, full_name, phone } = value;

        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered',
            });
        }

        // Create new user (default role: CITIZEN)
        const user = await User.create({
            email,
            password,
            role: 'CITIZEN',
            full_name,
            phone,
        });

        // Generate tokens
        const tokens = generateTokens(user);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    full_name: user.full_name,
                },
                ...tokens,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
        });
    }
});

// POST /api/auth/login - User login
router.post('/login', async (req, res) => {
    try {
        // Validate input
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        const { email, password } = value;

        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // Verify password
        const isValidPassword = await User.verifyPassword(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // Generate tokens
        const tokens = generateTokens(user);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    full_name: user.full_name,
                },
                ...tokens,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
        });
    }
});

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token required',
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, authConfig.jwtRefreshSecret);

        // Get user
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Generate new tokens
        const tokens = generateTokens(user);

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: tokens,
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Refresh token expired',
            });
        }
        return res.status(403).json({
            success: false,
            message: 'Invalid refresh token',
        });
    }
});

// GET /api/auth/profile - Get current user profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Get assigned areas if coordinator
        let assignedAreas = [];
        if (user.role === 'COORDINATOR') {
            assignedAreas = await User.getAssignedAreas(user.id);
        }

        res.json({
            success: true,
            data: {
                ...user,
                assignedAreas,
            },
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});

// PUT /api/auth/profile - Update current user profile
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { full_name, phone } = req.body;

        const updates = {};
        if (full_name) updates.full_name = full_name;
        if (phone) updates.phone = phone;

        const updatedUser = await User.update(req.user.id, updates);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser,
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});

// POST /api/auth/change-password - Change password
router.post('/change-password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required',
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters',
            });
        }

        // Get user with password
        const user = await User.findByEmail(req.user.email);

        // Verify current password
        const isValid = await User.verifyPassword(currentPassword, user.password_hash);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect',
            });
        }

        // Change password
        await User.changePassword(req.user.id, newPassword);

        res.json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});

module.exports = router;
