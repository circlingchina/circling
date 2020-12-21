DO $$
DECLARE new_version DATE;
BEGIN
  new_version := '2020-12-21' ;
  UPDATE db_version SET db_version = new_version;
END $$;

ALTER TYPE event_category RENAME VALUE  '社群自发活动' TO '社群活动';
