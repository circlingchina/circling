DO $$
DECLARE new_version DATE;
BEGIN
  new_version := '2020-10-06' ;
  UPDATE db_version SET db_version = new_version;
END $$;

CREATE TABLE precreate_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL DEFAULT '',
  email VARCHAR NOT NULL DEFAULT '',
  salt VARCHAR NOT NULL DEFAULT '',
  password_hexdigest VARCHAR NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_precreate_users ON precreate_users (id);

CREATE FUNCTION cleanup_expired_precreate_users_after_5_mins() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  DELETE FROM precreate_users WHERE created_at < NOW() - INTERVAL '5 minutes';
  RETURN NEW;
END;
$$;

CREATE TRIGGER cleanup_expired_precreate_user_after_5_mins_trigger
AFTER INSERT ON precreate_users
EXECUTE PROCEDURE cleanup_expired_precreate_users_after_5_mins();
