DO $$
DECLARE new_version DATE;
BEGIN
  new_version := '2020-07-08' ;
  UPDATE db_version SET db_version = new_version;
END $$;

CREATE TYPE premium_level AS ENUM (
  '0',
  '1',
  '2',
  '3'
);

ALTER TABLE users 
ADD COLUMN premium_level premium_level DEFAULT '0',
ADD COLUMN premium_expired_at date DEFAULT NULL;

UPDATE users set premium_level = '1',premium_expired_at = '2020-11-01';
