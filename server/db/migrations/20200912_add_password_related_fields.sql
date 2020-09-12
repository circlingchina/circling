DO $$
DECLARE new_version DATE;
BEGIN
  new_version := '2020-09-12' ;
  UPDATE db_version SET db_version = new_version;
END $$;

ALTER TABLE users ADD COLUMN salt VARCHAR NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN password_hexdigest VARCHAR NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_updated_at();
