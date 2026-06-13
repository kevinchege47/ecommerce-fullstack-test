-- Seed inventory items
INSERT INTO inventory_item (id, name, sku, quantity, unit_price, category) VALUES
  (1, 'Wireless Earbuds', 'SKU-001', 45, 2500.00, 'Electronics'),
  (2, 'USB-C Hub 7-Port', 'SKU-002', 8, 3200.00, 'Electronics'),
  (3, 'Laptop Stand', 'SKU-003', 3, 1800.00, 'Accessories'),
  (4, 'Mechanical Keyboard', 'SKU-004', 22, 5500.00, 'Electronics'),
  (5, 'Webcam 1080p', 'SKU-005', 6, 4100.00, 'Electronics'),
  (6, 'Mouse Pad XL', 'SKU-006', 55, 850.00, 'Accessories'),
  (7, 'HDMI Cable 2m', 'SKU-007', 9, 600.00, 'Cables'),
  (8, 'Desk Lamp LED', 'SKU-008', 2, 1200.00, 'Office'),
  (9, 'Notebook A5', 'SKU-009', 120, 350.00, 'Stationery'),
  (10, 'Phone Stand', 'SKU-010', 7, 450.00, 'Accessories');

-- Seed some historical orders
INSERT INTO orders (id, customer_name, customer_email, inventory_item_id, quantity, total_price, status, created_at) VALUES
  (1, 'Alice Wanjiku', 'alice@example.com', 1, 2, 5000.00, 'DELIVERED', DATEADD(DAY, -5, NOW())),
  (2, 'Brian Ochieng', 'brian@example.com', 4, 1, 5500.00, 'PROCESSING', DATEADD(DAY, -3, NOW())),
  (3, 'Carol Mutua', 'carol@example.com', 6, 3, 2550.00, 'DELIVERED', DATEADD(DAY, -2, NOW())),
  (4, 'David Kamau', 'david@example.com', 2, 1, 3200.00, 'CANCELLED', DATEADD(DAY, -1, NOW())),
  (5, 'Eve Njeri', 'eve@example.com', 9, 5, 1750.00, 'PROCESSING', NOW());
