-- Add fields to support CSV import data
-- Fields untuk brand commission
ALTER TABLE products ADD COLUMN brandCommissionRate DECIMAL(5,4) DEFAULT 0.00;
ALTER TABLE products ADD COLUMN brandCommissionAmount DECIMAL(12,2) DEFAULT 0.00;

-- Fields untuk currency dan add-on
ALTER TABLE transactions ADD COLUMN currency VARCHAR(10) DEFAULT 'IDR';
ALTER TABLE transaction_items ADD COLUMN addOnPrice DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE transaction_items ADD COLUMN discountPercent DECIMAL(5,2) DEFAULT 0.00;
ALTER TABLE transaction_items ADD COLUMN discountAmount DECIMAL(10,2) DEFAULT 0.00;

-- Fields untuk cost analysis
ALTER TABLE transaction_items ADD COLUMN totalCost DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE transaction_items ADD COLUMN profit DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE transaction_items ADD COLUMN paidToBrand DECIMAL(12,2) DEFAULT 0.00;

-- Add index for better performance
ALTER TABLE products ADD INDEX idx_brand (brand);
ALTER TABLE products ADD INDEX idx_category (category);
ALTER TABLE transactions ADD INDEX idx_currency (currency);
ALTER TABLE transactions ADD INDEX idx_date (date);
