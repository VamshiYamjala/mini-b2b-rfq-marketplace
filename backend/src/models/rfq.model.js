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
        u.email as buyer_email
       FROM rfqs r
       JOIN users u ON r.buyer_id = u.id
       WHERE r.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }
};

module.exports = RfqModel;
