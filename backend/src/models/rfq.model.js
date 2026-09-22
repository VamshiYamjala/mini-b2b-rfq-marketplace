const pool = require('../config/db');

const RfqModel = {
  async create({ buyerId, productServiceName, requirementDescription, quantity, deliveryLocation, deadline }) {
    const [result] = await pool.query(
      `INSERT INTO rfqs 
        (buyer_id, product_service_name, requirement_description, quantity, delivery_location, deadline, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'OPEN')`,
      [buyerId, productServiceName, requirementDescription, quantity, deliveryLocation, deadline]
    );

    return this.findById(result.insertId);
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT 
        r.id, 
        r.buyer_id, 
        r.product_service_name, 
        r.requirement_description, 
        r.quantity, 
        r.delivery_location, 
        r.deadline, 
        r.status, 
        r.created_at, 
        r.updated_at,
        u.name as buyer_name,
        u.email as buyer_email,
        COUNT(q.id) AS quotation_count
       FROM rfqs r
       JOIN users u ON r.buyer_id = u.id
       LEFT JOIN quotations q ON r.id = q.rfq_id
       WHERE r.id = ?
       GROUP BY r.id
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async findMyRfqs(buyerId, status = null) {
    let query = `
      SELECT 
        r.id, 
        r.buyer_id, 
        r.product_service_name, 
        r.requirement_description, 
        r.quantity, 
        r.delivery_location, 
        r.deadline, 
        r.status, 
        r.created_at, 
        r.updated_at,
        COUNT(q.id) AS quotation_count
      FROM rfqs r
      LEFT JOIN quotations q ON r.id = q.rfq_id
      WHERE r.buyer_id = ?
    `;
    const params = [buyerId];

    if (status && ['OPEN', 'CLOSED'].includes(status.toUpperCase())) {
      query += ` AND r.status = ?`;
      params.push(status.toUpperCase());
    }

    query += ` GROUP BY r.id ORDER BY r.created_at DESC`;

    const [rows] = await pool.query(query, params);
    return rows;
  },

  async findPublicRfqs({ search, location, status = 'OPEN', page = 1, limit = 10 }) {
    let whereConditions = [];
    let params = [];

    // Filter by status (default OPEN)
    const validStatus = status ? status.toUpperCase() : 'OPEN';
    if (['OPEN', 'CLOSED'].includes(validStatus)) {
      whereConditions.push('r.status = ?');
      params.push(validStatus);
    }

    // Filter by keyword search across product name and description
    if (search && search.trim().length > 0) {
      whereConditions.push('(r.product_service_name LIKE ? OR r.requirement_description LIKE ?)');
      const pattern = `%${search.trim()}%`;
      params.push(pattern, pattern);
    }

    // Filter by location
    if (location && location.trim().length > 0) {
      whereConditions.push('r.delivery_location LIKE ?');
      params.push(`%${location.trim()}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count total matching records
    const countSql = `SELECT COUNT(*) AS total FROM rfqs r ${whereClause}`;
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0].total;

    // Apply pagination
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (safePage - 1) * safeLimit;

    const dataSql = `
      SELECT 
        r.id, 
        r.buyer_id, 
        r.product_service_name, 
        r.requirement_description, 
        r.quantity, 
        r.delivery_location, 
        r.deadline, 
        r.status, 
        r.created_at, 
        r.updated_at,
        u.name as buyer_name,
        COUNT(q.id) AS quotation_count
      FROM rfqs r
      JOIN users u ON r.buyer_id = u.id
      LEFT JOIN quotations q ON r.id = q.rfq_id
      ${whereClause}
      GROUP BY r.id
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const dataParams = [...params, safeLimit, offset];
    const [items] = await pool.query(dataSql, dataParams);

    return {
      items: items.map(rfq => ({
        ...rfq,
        is_expired: new Date(rfq.deadline) <= new Date()
      })),
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit)
    };
  },

  async update(id, buyerId, { productServiceName, requirementDescription, quantity, deliveryLocation, deadline }) {
    const [result] = await pool.query(
      `UPDATE rfqs SET 
        product_service_name = ?, 
        requirement_description = ?, 
        quantity = ?, 
        delivery_location = ?, 
        deadline = ?
       WHERE id = ? AND buyer_id = ?`,
      [productServiceName, requirementDescription, quantity, deliveryLocation, deadline, id, buyerId]
    );

    if (result.affectedRows === 0) {
      return null;
    }
    return this.findById(id);
  },

  async close(id, buyerId) {
    const [result] = await pool.query(
      `UPDATE rfqs SET status = 'CLOSED' WHERE id = ? AND buyer_id = ?`,
      [id, buyerId]
    );

    if (result.affectedRows === 0) {
      return null;
    }
    return this.findById(id);
  }
};

module.exports = RfqModel;
