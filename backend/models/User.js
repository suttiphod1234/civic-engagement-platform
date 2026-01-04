const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

class User {
    // Create new user
    static async create({ email, password, role, full_name, phone }) {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await query(
            `INSERT INTO users (email, password_hash, role, full_name, phone) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, role, full_name, phone, created_at`,
            [email, hashedPassword, role, full_name, phone]
        );

        return result.rows[0];
    }

    // Find user by email
    static async findByEmail(email) {
        const result = await query(
            'SELECT * FROM users WHERE email = $1 AND is_active = true',
            [email]
        );
        return result.rows[0];
    }

    // Find user by ID
    static async findById(id) {
        const result = await query(
            'SELECT id, email, role, full_name, phone, is_active, created_at FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    // Get all users (admin only)
    static async findAll({ page = 1, limit = 20, role = null }) {
        const offset = (page - 1) * limit;
        let queryText = 'SELECT id, email, role, full_name, phone, is_active, created_at FROM users';
        const params = [];

        if (role) {
            queryText += ' WHERE role = $1';
            params.push(role);
        }

        queryText += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
        params.push(limit, offset);

        const result = await query(queryText, params);

        // Get total count
        const countQuery = role
            ? 'SELECT COUNT(*) FROM users WHERE role = $1'
            : 'SELECT COUNT(*) FROM users';
        const countResult = await query(countQuery, role ? [role] : []);

        return {
            users: result.rows,
            total: parseInt(countResult.rows[0].count),
            page,
            totalPages: Math.ceil(countResult.rows[0].count / limit),
        };
    }

    // Update user
    static async update(id, updates) {
        const allowedFields = ['full_name', 'phone', 'role', 'is_active'];
        const fields = [];
        const values = [];
        let paramCount = 1;

        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                fields.push(`${key} = $${paramCount}`);
                values.push(updates[key]);
                paramCount++;
            }
        });

        if (fields.length === 0) {
            throw new Error('No valid fields to update');
        }

        values.push(id);
        const result = await query(
            `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} 
       RETURNING id, email, role, full_name, phone, is_active, updated_at`,
            values
        );

        return result.rows[0];
    }

    // Delete user (soft delete)
    static async delete(id) {
        const result = await query(
            'UPDATE users SET is_active = false WHERE id = $1 RETURNING id',
            [id]
        );
        return result.rows[0];
    }

    // Verify password
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Change password
    static async changePassword(id, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await query(
            'UPDATE users SET password_hash = $1 WHERE id = $2',
            [hashedPassword, id]
        );
    }

    // Assign coordinator to area
    static async assignToArea(userId, areaId) {
        const result = await query(
            `INSERT INTO user_area_assignments (user_id, area_id) 
       VALUES ($1, $2) 
       ON CONFLICT (user_id, area_id) DO NOTHING
       RETURNING *`,
            [userId, areaId]
        );
        return result.rows[0];
    }

    // Remove coordinator from area
    static async removeFromArea(userId, areaId) {
        await query(
            'DELETE FROM user_area_assignments WHERE user_id = $1 AND area_id = $2',
            [userId, areaId]
        );
    }

    // Get user's assigned areas
    static async getAssignedAreas(userId) {
        const result = await query(
            `SELECT a.* FROM areas a
       JOIN user_area_assignments uaa ON a.id = uaa.area_id
       WHERE uaa.user_id = $1 AND a.is_active = true`,
            [userId]
        );
        return result.rows;
    }
}

module.exports = User;
