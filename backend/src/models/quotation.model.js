const pool = require('../config/db');

const QuotationModel = {
  async create({ rfqId, supplierId, quotedPrice, estimatedDeliveryTime, message }) {
    const [result] = await pool.query(
      `INSERT INTO quotations 
        (rfq_id, supplier_id, quoted_price, estimated_delivery_time, message) 
       VALUES (?, ?, ?, ?, ?)`,
      [rfqId, supplierId, quotedPrice, estimatedDeliveryTime, message || null]
    );

    return this.findById(result.insertId);
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT 
        q.id,
        q.rfq_id,
        q.supplier_id,
        q.quoted_price,
        q.estimated_delivery_time,
        q.message,
        q.created_at,
        q.updated_at,
        u.name as supplier_name,
        u.email as supplier_email
       FROM quotations q
       JOIN users u ON q.supplier_id = u.id
       WHERE q.id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async findByRfqAndSupplier(rfqId, supplierId) {
    const [rows] = await pool.query(
      `SELECT id, rfq_id, supplier_id, quoted_price, estimated_delivery_time, message, created_at 
       FROM quotations 
       WHERE rfq_id = ? AND supplier_id = ? 
       LIMIT 1`,
      [rfqId, supplierId]
    );
    return rows[0] || null;
  },

  async findByRfqId(rfqId) {
    const [rows] = await pool.query(
      `SELECT 
        q.id,
        q.rfq_id,
        q.supplier_id,
        q.quoted_price,
        q.estimated_delivery_time,
        q.message,
        q.created_at,
        q.updated_at,
        u.name as supplier_name,
        u.email as supplier_email
       FROM quotations q
       JOIN users u ON q.supplier_id = u.id
       WHERE q.rfq_id = ?
       ORDER BY q.created_at DESC`,
      [rfqId]
    );
    return rows;
  },

  async findMyQuotations(supplierId) {
    const [rows] = await pool.query(
      `SELECT 
        q.id,
        q.rfq_id,
        q.supplier_id,
        q.quoted_price,
        q.estimated_delivery_time,
        q.message,
        q.created_at,
        q.updated_at,
        r.product_service_name,
        r.quantity as rfq_quantity,
        r.delivery_location,
        r.deadline as rfq_deadline,
        r.status as rfq_status,
        u.name as buyer_name
       FROM quotations q
       JOIN rfqs r ON q.rfq_id = r.id
       JOIN users u ON r.buyer_id = u.id
       WHERE q.supplier_id = ?
       ORDER BY q.created_at DESC`,
      [supplierId]
    );
    return rows;
  }
};

module.exports = QuotationModel;
