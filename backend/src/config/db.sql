-- Mini B2B RFQ Marketplace Database Schema
-- Matches Engineering Specification Section 6 exactly

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('BUYER', 'SUPPLIER') NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS rfqs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  buyer_id INT NOT NULL,
  product_service_name VARCHAR(150) NOT NULL,
  requirement_description TEXT NOT NULL,
  quantity INT NOT NULL,
  delivery_location VARCHAR(150) NOT NULL,
  deadline DATETIME NOT NULL,
  status ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT chk_rfq_quantity CHECK (quantity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS quotations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rfq_id INT NOT NULL,
  supplier_id INT NOT NULL,
  quoted_price DECIMAL(12, 2) NOT NULL,
  estimated_delivery_time VARCHAR(60) NOT NULL,
  message TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE RESTRICT,
  FOREIGN KEY (supplier_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT uq_rfq_supplier UNIQUE (rfq_id, supplier_id),
  CONSTRAINT chk_quoted_price CHECK (quoted_price > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Performance Indexes per Section 6.4
CREATE INDEX idx_rfqs_buyer_id ON rfqs(buyer_id);
CREATE INDEX idx_rfqs_status_deadline ON rfqs(status, deadline);
CREATE INDEX idx_quotations_rfq_id ON quotations(rfq_id);
CREATE INDEX idx_quotations_supplier_id ON quotations(supplier_id);

-- Session Store Table for express-mysql-session
CREATE TABLE IF NOT EXISTS sessions (
  session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
  expires INT(11) UNSIGNED NOT NULL,
  data MEDIUMTEXT COLLATE utf8mb4_bin,
  PRIMARY KEY (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
