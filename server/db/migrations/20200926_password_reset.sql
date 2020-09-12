DO $$
DECLARE new_version DATE;
BEGIN
  new_version := '2020-09-26' ;
  UPDATE db_version SET db_version = new_version;
END $$;

CREATE TABLE password_reset (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_password_reset_user_id ON password_reset (user_id);

CREATE FUNCTION cleanup_expired_password_reset_after_5_mins() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  DELETE FROM password_reset WHERE created_at < NOW() - INTERVAL '5 minutes';
  RETURN NEW;
END;
$$;

CREATE TRIGGER cleanup_expired_password_reset_after_5_mins_trigger
AFTER INSERT ON password_reset
EXECUTE PROCEDURE cleanup_expired_password_reset_after_5_mins();
