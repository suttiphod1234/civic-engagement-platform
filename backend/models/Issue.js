const { query, transaction } = require('../config/database');

class Issue {
    // Create new issue
    static async create({ title, description, category_id, area_id, user_id, latitude, longitude, images = [] }) {
        return await transaction(async (client) => {
            // Insert issue
            const issueResult = await client.query(
                `INSERT INTO issues (title, description, category_id, area_id, user_id, latitude, longitude) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
                [title, description, category_id, area_id, user_id, latitude, longitude]
            );

            const issue = issueResult.rows[0];

            // Insert images if any
            if (images.length > 0) {
                const imageValues = images.map((img, idx) =>
                    `($1, $${idx + 2})`
                ).join(', ');

                await client.query(
                    `INSERT INTO issue_images (issue_id, image_path) VALUES ${imageValues}`,
                    [issue.id, ...images]
                );
            }

            return issue;
        });
    }

    // Find issue by ID with all related data
    static async findById(id) {
        const result = await query(
            `SELECT i.*, 
              u.full_name as user_name, u.email as user_email,
              c.name_th as category_name_th, c.name_en as category_name_en,
              a.name_th as area_name_th, a.name_en as area_name_en,
              a.province, a.district, a.subdistrict
       FROM issues i
       LEFT JOIN users u ON i.user_id = u.id
       LEFT JOIN categories c ON i.category_id = c.id
       LEFT JOIN areas a ON i.area_id = a.id
       WHERE i.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const issue = result.rows[0];

        // Get images
        const imagesResult = await query(
            'SELECT * FROM issue_images WHERE issue_id = $1 ORDER BY uploaded_at',
            [id]
        );
        issue.images = imagesResult.rows;

        // Get updates/comments
        const updatesResult = await query(
            `SELECT iu.*, u.full_name as user_name 
       FROM issue_updates iu
       LEFT JOIN users u ON iu.user_id = u.id
       WHERE iu.issue_id = $1 
       ORDER BY iu.created_at DESC`,
            [id]
        );
        issue.updates = updatesResult.rows;

        return issue;
    }

    // Find all issues with filters
    static async findAll({
        page = 1,
        limit = 20,
        status = null,
        category_id = null,
        area_id = null,
        user_id = null,
        priority = null,
        start_date = null,
        end_date = null,
        search = null
    }) {
        const offset = (page - 1) * limit;
        const params = [];
        let paramCount = 1;

        let queryText = `
      SELECT i.*, 
             u.full_name as user_name,
             c.name_th as category_name_th, c.name_en as category_name_en,
             a.name_th as area_name_th, a.name_en as area_name_en,
             (SELECT COUNT(*) FROM issue_images WHERE issue_id = i.id) as image_count
      FROM issues i
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN areas a ON i.area_id = a.id
      WHERE 1=1
    `;

        if (status) {
            queryText += ` AND i.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }

        if (category_id) {
            queryText += ` AND i.category_id = $${paramCount}`;
            params.push(category_id);
            paramCount++;
        }

        if (area_id) {
            queryText += ` AND i.area_id = $${paramCount}`;
            params.push(area_id);
            paramCount++;
        }

        if (user_id) {
            queryText += ` AND i.user_id = $${paramCount}`;
            params.push(user_id);
            paramCount++;
        }

        if (priority) {
            queryText += ` AND i.priority = $${paramCount}`;
            params.push(priority);
            paramCount++;
        }

        if (start_date) {
            queryText += ` AND i.created_at >= $${paramCount}`;
            params.push(start_date);
            paramCount++;
        }

        if (end_date) {
            queryText += ` AND i.created_at <= $${paramCount}`;
            params.push(end_date);
            paramCount++;
        }

        if (search) {
            queryText += ` AND (i.title ILIKE $${paramCount} OR i.description ILIKE $${paramCount})`;
            params.push(`%${search}%`);
            paramCount++;
        }

        queryText += ` ORDER BY i.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(limit, offset);

        const result = await query(queryText, params);

        // Get total count with same filters
        let countQuery = 'SELECT COUNT(*) FROM issues i WHERE 1=1';
        const countParams = [];
        let countParamCount = 1;

        if (status) {
            countQuery += ` AND i.status = $${countParamCount}`;
            countParams.push(status);
            countParamCount++;
        }
        if (category_id) {
            countQuery += ` AND i.category_id = $${countParamCount}`;
            countParams.push(category_id);
            countParamCount++;
        }
        if (area_id) {
            countQuery += ` AND i.area_id = $${countParamCount}`;
            countParams.push(area_id);
            countParamCount++;
        }
        if (user_id) {
            countQuery += ` AND i.user_id = $${countParamCount}`;
            countParams.push(user_id);
            countParamCount++;
        }
        if (priority) {
            countQuery += ` AND i.priority = $${countParamCount}`;
            countParams.push(priority);
            countParamCount++;
        }
        if (start_date) {
            countQuery += ` AND i.created_at >= $${countParamCount}`;
            countParams.push(start_date);
            countParamCount++;
        }
        if (end_date) {
            countQuery += ` AND i.created_at <= $${countParamCount}`;
            countParams.push(end_date);
            countParamCount++;
        }
        if (search) {
            countQuery += ` AND (i.title ILIKE $${countParamCount} OR i.description ILIKE $${countParamCount})`;
            countParams.push(`%${search}%`);
            countParamCount++;
        }

        const countResult = await query(countQuery, countParams);

        return {
            issues: result.rows,
            total: parseInt(countResult.rows[0].count),
            page,
            totalPages: Math.ceil(countResult.rows[0].count / limit),
        };
    }

    // Update issue
    static async update(id, updates) {
        const allowedFields = ['title', 'description', 'category_id', 'area_id', 'status', 'priority', 'latitude', 'longitude'];
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

        // If status is being changed to RESOLVED, set resolved_at
        if (updates.status === 'RESOLVED') {
            fields.push(`resolved_at = CURRENT_TIMESTAMP`);
        }

        values.push(id);
        const result = await query(
            `UPDATE issues SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        return result.rows[0];
    }

    // Update status and add comment
    static async updateStatus(issueId, userId, status, comment) {
        return await transaction(async (client) => {
            // Update issue status
            const updateQuery = status === 'RESOLVED'
                ? 'UPDATE issues SET status = $1, resolved_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *'
                : 'UPDATE issues SET status = $1 WHERE id = $2 RETURNING *';

            const issueResult = await client.query(updateQuery, [status, issueId]);

            // Add update record
            await client.query(
                'INSERT INTO issue_updates (issue_id, user_id, status, comment) VALUES ($1, $2, $3, $4)',
                [issueId, userId, status, comment]
            );

            return issueResult.rows[0];
        });
    }

    // Add comment/update
    static async addUpdate(issueId, userId, comment, status = null) {
        const result = await query(
            'INSERT INTO issue_updates (issue_id, user_id, status, comment) VALUES ($1, $2, $3, $4) RETURNING *',
            [issueId, userId, status, comment]
        );
        return result.rows[0];
    }

    // Delete issue
    static async delete(id) {
        // Images will be deleted automatically due to CASCADE
        const result = await query(
            'DELETE FROM issues WHERE id = $1 RETURNING id',
            [id]
        );
        return result.rows[0];
    }

    // Get statistics
    static async getStatistics({ start_date = null, end_date = null, area_id = null }) {
        const params = [];
        let paramCount = 1;
        let whereClause = 'WHERE 1=1';

        if (start_date) {
            whereClause += ` AND created_at >= $${paramCount}`;
            params.push(start_date);
            paramCount++;
        }

        if (end_date) {
            whereClause += ` AND created_at <= $${paramCount}`;
            params.push(end_date);
            paramCount++;
        }

        if (area_id) {
            whereClause += ` AND area_id = $${paramCount}`;
            params.push(area_id);
            paramCount++;
        }

        const result = await query(
            `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'NEW' THEN 1 END) as new_count,
        COUNT(CASE WHEN status = 'IN_PROGRESS' THEN 1 END) as in_progress_count,
        COUNT(CASE WHEN status = 'RESOLVED' THEN 1 END) as resolved_count,
        COUNT(CASE WHEN status = 'CLOSED' THEN 1 END) as closed_count,
        COUNT(CASE WHEN priority = 'URGENT' THEN 1 END) as urgent_count,
        COUNT(CASE WHEN priority = 'HIGH' THEN 1 END) as high_count
       FROM issues ${whereClause}`,
            params
        );

        return result.rows[0];
    }
}

module.exports = Issue;
