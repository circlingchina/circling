CREATE TYPE product_category AS ENUM (
  'SINGLE_EVENT',
  'MONTHLY',
  'HALF_YEAR'
);

CREATE TYPE charge_status AS ENUM (
  'PENDING',
  'PAID',
  'CANCELLED',
  'FAILED'
);

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE user_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  charge_id varchar NOT NULL,
  order_no varchar NOT NULL,
  amount integer NOT NULL,
  currency varchar NOT NULL,
  category product_category  NOT NULL,
  charge_created integer NOT NULL,
  charge_paied_at integer DEFAULT NULL,
  status charge_status NOT NULL, 
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_charges_user_id
on user_charges (user_id);

CREATE UNIQUE INDEX idx_uniq_charge_id
on user_charges (charge_id);

CREATE UNIQUE INDEX idx_uniq_order_no
on user_charges (order_no);

CREATE TRIGGER user_charges_set_updated_at
BEFORE UPDATE ON user_charges
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_updated_at();

ALTER TYPE product_category ADD VALUE 'VIP';
