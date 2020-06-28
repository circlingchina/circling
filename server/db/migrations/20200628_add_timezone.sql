DO $$
DECLARE new_version DATE;
BEGIN
  new_version := '2020-06-28' ;
  UPDATE db_version SET db_version = new_version;
END $$;


ALTER TABLE events ALTER COLUMN start_time TYPE TIMESTAMP WITH TIME ZONE USING start_time AT TIME ZONE 'Asia/Shanghai';
ALTER TABLE events ALTER COLUMN end_time TYPE TIMESTAMP WITH TIME ZONE USING end_time AT TIME ZONE 'Asia/Shanghai';

ALTER DATABASE circling_db SET timezone TO 'UTC';
