-- Up Migration
ALTER TABLE products
  ADD COLUMN category               TEXT NOT NULL DEFAULT 'uncategorized',
  ADD COLUMN compare_at_price_cents INTEGER
                                    CHECK (compare_at_price_cents > price_cents),
  ADD COLUMN is_new                 BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX products_category_idx ON products (category);

-- Down Migration

DROP INDEX products_category_idx;

ALTER TABLE products
  DROP COLUMN is_new,
  DROP COLUMN compare_at_price_cents,
  DROP COLUMN category;
