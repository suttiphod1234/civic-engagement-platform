const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { verifyToken, requireMinRole } = require('../middleware/auth');

// GET /api/analytics/overview - Dashboard overview statistics
router.get('/overview', verifyToken, requireMinRole('COORDINATOR'), async (req, res) => {
    try {
        const { start_date, end_date, area_id } = req.query;

        let whereClause = 'WHERE 1=1';
        const params = [];
        let paramCount = 1;

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
        COUNT(*) as total_issues,
        COUNT(CASE WHEN status = 'NEW' THEN 1 END) as new_issues,
        COUNT(CASE WHEN status = 'IN_PROGRESS' THEN 1 END) as in_progress_issues,
        COUNT(CASE WHEN status = 'RESOLVED' THEN 1 END) as resolved_issues,
        COUNT(CASE WHEN status = 'CLOSED' THEN 1 END) as closed_issues,
        COUNT(CASE WHEN priority = 'URGENT' THEN 1 END) as urgent_issues,
        COUNT(CASE WHEN priority = 'HIGH' THEN 1 END) as high_priority_issues,
        AVG(CASE WHEN resolved_at IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (resolved_at - created_at))/86400 
          END) as avg_resolution_days
       FROM issues ${whereClause}`,
            params
        );

        res.json({
            success: true,
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Get overview error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching overview',
        });
    }
});

// GET /api/analytics/by-category - Issues grouped by category
router.get('/by-category', verifyToken, requireMinRole('COORDINATOR'), async (req, res) => {
    try {
        const { start_date, end_date, area_id } = req.query;

        let whereClause = 'WHERE 1=1';
        const params = [];
        let paramCount = 1;

        if (start_date) {
            whereClause += ` AND i.created_at >= $${paramCount}`;
            params.push(start_date);
            paramCount++;
        }

        if (end_date) {
            whereClause += ` AND i.created_at <= $${paramCount}`;
            params.push(end_date);
            paramCount++;
        }

        if (area_id) {
            whereClause += ` AND i.area_id = $${paramCount}`;
            params.push(area_id);
            paramCount++;
        }

        const result = await query(
            `SELECT 
        c.id,
        c.name_th,
        c.name_en,
        c.icon,
        COUNT(i.id) as total_issues,
        COUNT(CASE WHEN i.status = 'NEW' THEN 1 END) as new_issues,
        COUNT(CASE WHEN i.status = 'IN_PROGRESS' THEN 1 END) as in_progress_issues,
        COUNT(CASE WHEN i.status = 'RESOLVED' THEN 1 END) as resolved_issues
       FROM categories c
       LEFT JOIN issues i ON c.id = i.category_id ${whereClause.replace('WHERE 1=1', '')}
       WHERE c.is_active = true
       GROUP BY c.id, c.name_th, c.name_en, c.icon
       ORDER BY total_issues DESC`,
            params
        );

        res.json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error('Get by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching category analytics',
        });
    }
});

// GET /api/analytics/by-area - Issues grouped by area
router.get('/by-area', verifyToken, requireMinRole('COORDINATOR'), async (req, res) => {
    try {
        const { start_date, end_date, province } = req.query;

        let whereClause = 'WHERE 1=1';
        const params = [];
        let paramCount = 1;

        if (start_date) {
            whereClause += ` AND i.created_at >= $${paramCount}`;
            params.push(start_date);
            paramCount++;
        }

        if (end_date) {
            whereClause += ` AND i.created_at <= $${paramCount}`;
            params.push(end_date);
            paramCount++;
        }

        if (province) {
            whereClause += ` AND a.province = $${paramCount}`;
            params.push(province);
            paramCount++;
        }

        const result = await query(
            `SELECT 
        a.id,
        a.name_th,
        a.name_en,
        a.province,
        a.district,
        COUNT(i.id) as total_issues,
        COUNT(CASE WHEN i.status = 'NEW' THEN 1 END) as new_issues,
        COUNT(CASE WHEN i.status = 'IN_PROGRESS' THEN 1 END) as in_progress_issues,
        COUNT(CASE WHEN i.status = 'RESOLVED' THEN 1 END) as resolved_issues
       FROM areas a
       LEFT JOIN issues i ON a.id = i.area_id ${whereClause.replace('WHERE 1=1', '')}
       WHERE a.is_active = true
       GROUP BY a.id, a.name_th, a.name_en, a.province, a.district
       ORDER BY total_issues DESC`,
            params
        );

        res.json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error('Get by area error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching area analytics',
        });
    }
});

// GET /api/analytics/by-status - Issues grouped by status
router.get('/by-status', verifyToken, requireMinRole('COORDINATOR'), async (req, res) => {
    try {
        const { start_date, end_date, area_id, category_id } = req.query;

        let whereClause = 'WHERE 1=1';
        const params = [];
        let paramCount = 1;

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

        if (category_id) {
            whereClause += ` AND category_id = $${paramCount}`;
            params.push(category_id);
            paramCount++;
        }

        const result = await query(
            `SELECT 
        status,
        COUNT(*) as count
       FROM issues ${whereClause}
       GROUP BY status
       ORDER BY count DESC`,
            params
        );

        res.json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error('Get by status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching status analytics',
        });
    }
});

// GET /api/analytics/trends - Time-series data for trends
router.get('/trends', verifyToken, requireMinRole('COORDINATOR'), async (req, res) => {
    try {
        const { start_date, end_date, area_id, category_id, interval = 'day' } = req.query;

        let whereClause = 'WHERE 1=1';
        const params = [];
        let paramCount = 1;

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

        if (category_id) {
            whereClause += ` AND category_id = $${paramCount}`;
            params.push(category_id);
            paramCount++;
        }

        // Determine date truncation based on interval
        let dateTrunc = 'day';
        if (interval === 'week') dateTrunc = 'week';
        else if (interval === 'month') dateTrunc = 'month';

        const result = await query(
            `SELECT 
        DATE_TRUNC('${dateTrunc}', created_at) as period,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'NEW' THEN 1 END) as new_count,
        COUNT(CASE WHEN status = 'IN_PROGRESS' THEN 1 END) as in_progress_count,
        COUNT(CASE WHEN status = 'RESOLVED' THEN 1 END) as resolved_count
       FROM issues ${whereClause}
       GROUP BY period
       ORDER BY period ASC`,
            params
        );

        res.json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error('Get trends error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching trends',
        });
    }
});

// GET /api/analytics/top-issues - Most reported issues
router.get('/top-issues', verifyToken, requireMinRole('COORDINATOR'), async (req, res) => {
    try {
        const { start_date, end_date, limit = 10 } = req.query;

        let whereClause = 'WHERE 1=1';
        const params = [];
        let paramCount = 1;

        if (start_date) {
            whereClause += ` AND i.created_at >= $${paramCount}`;
            params.push(start_date);
            paramCount++;
        }

        if (end_date) {
            whereClause += ` AND i.created_at <= $${paramCount}`;
            params.push(end_date);
            paramCount++;
        }

        params.push(parseInt(limit));

        const result = await query(
            `SELECT 
        i.id,
        i.title,
        i.status,
        i.priority,
        i.created_at,
        c.name_th as category_name,
        a.name_th as area_name,
        (SELECT COUNT(*) FROM issue_updates WHERE issue_id = i.id) as update_count,
        (SELECT COUNT(*) FROM issue_images WHERE issue_id = i.id) as image_count
       FROM issues i
       LEFT JOIN categories c ON i.category_id = c.id
       LEFT JOIN areas a ON i.area_id = a.id
       ${whereClause}
       ORDER BY update_count DESC, created_at DESC
       LIMIT $${paramCount}`,
            params
        );

        res.json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error('Get top issues error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching top issues',
        });
    }
});

module.exports = router;
