DO $$
DECLARE new_version DATE;
BEGIN
  new_version := '2020-07-30' ;
  UPDATE db_version SET db_version = new_version;
END $$;

UPDATE users SET premium_expired_at = '1970-01-01' where premium_expired_at is NULL;

ALTER TABLE users ALTER COLUMN premium_expired_at SET NOT NULL;
ALTER TABLE users ALTER COLUMN premium_expired_at SET DEFAULT '1970-01-01';
