DO $$
DECLARE new_version DATE;
BEGIN
  new_version := '2020-07-28' ;
  UPDATE db_version SET db_version = new_version;
END $$;

ALTER TYPE premium_level ADD VALUE '4';
