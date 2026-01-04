const { query } = require('../config/database');

class Category {
    // Create new category
    static async create({ name_th, name_en, description, icon }) {
        const result = await query(
            `INSERT INTO categories (name_th, name_en, description, icon) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
            [name_th, name_en, description, icon]
        );
        return result.rows[0];
    }

    // Find all categories
    static async findAll({ active_only = true } = {}) {
        const queryText = active_only
            ? 'SELECT * FROM categories WHERE is_active = true ORDER BY name_th'
            : 'SELECT * FROM categories ORDER BY name_th';

        const result = await query(queryText);
        return result.rows;
    }

    // Find category by ID
    static async findById(id) {
        const result = await query(
            'SELECT * FROM categories WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    // Update category
    static async update(id, updates) {
        const allowedFields = ['name_th', 'name_en', 'description', 'icon', 'is_active'];
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
            `UPDATE categories SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        return result.rows[0];
    }

    // Delete category (soft delete)
    static async delete(id) {
        const result = await query(
            'UPDATE categories SET is_active = false WHERE id = $1 RETURNING id',
            [id]
        );
        return result.rows[0];
    }

    // Get category statistics
    static async getStatistics(categoryId = null) {
        if (categoryId) {
            const result = await query(
                `SELECT 
          c.*,
          COUNT(i.id) as total_issues,
          COUNT(CASE WHEN i.status = 'NEW' THEN 1 END) as new_issues,
          COUNT(CASE WHEN i.status = 'IN_PROGRESS' THEN 1 END) as in_progress_issues,
          COUNT(CASE WHEN i.status = 'RESOLVED' THEN 1 END) as resolved_issues
         FROM categories c
         LEFT JOIN issues i ON c.id = i.category_id
         WHERE c.id = $1
         GROUP BY c.id`,
                [categoryId]
            );
            return result.rows[0];
        } else {
            const result = await query(
                `SELECT 
          c.*,
          COUNT(i.id) as total_issues,
          COUNT(CASE WHEN i.status = 'NEW' THEN 1 END) as new_issues,
          COUNT(CASE WHEN i.status = 'IN_PROGRESS' THEN 1 END) as in_progress_issues,
          COUNT(CASE WHEN i.status = 'RESOLVED' THEN 1 END) as resolved_issues
         FROM categories c
         LEFT JOIN issues i ON c.id = i.category_id
         WHERE c.is_active = true
         GROUP BY c.id
         ORDER BY total_issues DESC`
            );
            return result.rows;
        }
    }
}

module.exports = Category;
