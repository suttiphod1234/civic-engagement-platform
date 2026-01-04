const { query } = require('../config/database');

class Area {
    // Create new area
    static async create({ name_th, name_en, province, district, subdistrict, postal_code }) {
        const result = await query(
            `INSERT INTO areas (name_th, name_en, province, district, subdistrict, postal_code) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
            [name_th, name_en, province, district, subdistrict, postal_code]
        );
        return result.rows[0];
    }

    // Find all areas
    static async findAll({ active_only = true, province = null } = {}) {
        let queryText = 'SELECT * FROM areas WHERE 1=1';
        const params = [];
        let paramCount = 1;

        if (active_only) {
            queryText += ' AND is_active = true';
        }

        if (province) {
            queryText += ` AND province = $${paramCount}`;
            params.push(province);
            paramCount++;
        }

        queryText += ' ORDER BY province, district, name_th';

        const result = await query(queryText, params);
        return result.rows;
    }

    // Find area by ID
    static async findById(id) {
        const result = await query(
            'SELECT * FROM areas WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    // Update area
    static async update(id, updates) {
        const allowedFields = ['name_th', 'name_en', 'province', 'district', 'subdistrict', 'postal_code', 'is_active'];
        const fields = [];
        const values = [];
        let paramCount = 1;

        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key) && updates[key] !== undefined) {
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
            `UPDATE areas SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        return result.rows[0];
    }

    // Delete area (soft delete)
    static async delete(id) {
        const result = await query(
            'UPDATE areas SET is_active = false WHERE id = $1 RETURNING id',
            [id]
        );
        return result.rows[0];
    }

    // Get area statistics
    static async getStatistics(areaId = null) {
        if (areaId) {
            const result = await query(
                `SELECT 
          a.*,
          COUNT(i.id) as total_issues,
          COUNT(CASE WHEN i.status = 'NEW' THEN 1 END) as new_issues,
          COUNT(CASE WHEN i.status = 'IN_PROGRESS' THEN 1 END) as in_progress_issues,
          COUNT(CASE WHEN i.status = 'RESOLVED' THEN 1 END) as resolved_issues
         FROM areas a
         LEFT JOIN issues i ON a.id = i.area_id
         WHERE a.id = $1
         GROUP BY a.id`,
                [areaId]
            );
            return result.rows[0];
        } else {
            const result = await query(
                `SELECT 
          a.*,
          COUNT(i.id) as total_issues,
          COUNT(CASE WHEN i.status = 'NEW' THEN 1 END) as new_issues,
          COUNT(CASE WHEN i.status = 'IN_PROGRESS' THEN 1 END) as in_progress_issues,
          COUNT(CASE WHEN i.status = 'RESOLVED' THEN 1 END) as resolved_issues
         FROM areas a
         LEFT JOIN issues i ON a.id = i.area_id
         WHERE a.is_active = true
         GROUP BY a.id
         ORDER BY total_issues DESC`
            );
            return result.rows;
        }
    }

    // Get all provinces
    static async getProvinces() {
        const result = await query(
            'SELECT DISTINCT province FROM areas WHERE is_active = true ORDER BY province'
        );
        return result.rows.map(row => row.province);
    }

    // Get coordinators assigned to area
    static async getCoordinators(areaId) {
        const result = await query(
            `SELECT u.id, u.email, u.full_name, u.phone, uaa.assigned_at
       FROM users u
       JOIN user_area_assignments uaa ON u.id = uaa.user_id
       WHERE uaa.area_id = $1 AND u.is_active = true`,
            [areaId]
        );
        return result.rows;
    }
}

module.exports = Area;
