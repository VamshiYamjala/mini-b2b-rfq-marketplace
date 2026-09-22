-- Dev Seed Data per Engineering Specification Level 1
-- Test credentials: Password123

INSERT INTO users (id, name, email, password_hash, role) VALUES
  (1, 'Acme Buyer Corp', 'buyer@example.com', '$2b$10$5pkyzBtEfwYT7qUgPCtx7.3.OmHvsTqyBaL6BIp1ARapGoMwg4yze', 'BUYER'),
  (2, 'Global Supplies Ltd', 'supplier@example.com', '$2b$10$5pkyzBtEfwYT7qUgPCtx7.3.OmHvsTqyBaL6BIp1ARapGoMwg4yze', 'SUPPLIER')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO rfqs (id, buyer_id, product_service_name, requirement_description, quantity, delivery_location, deadline, status) VALUES
  (1, 1, 'Industrial Stainless Steel Valves', 'Looking for 500 units of high-grade 316 stainless steel industrial ball valves with ISO certification.', 500, 'Chicago, IL Warehouse', DATE_ADD(NOW(), INTERVAL 14 DAY), 'OPEN')
ON DUPLICATE KEY UPDATE product_service_name=VALUES(product_service_name);
