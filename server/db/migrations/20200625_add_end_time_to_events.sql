CREATE TABLE db_version (
    db_version DATE NOT NULL DEFAULT ('1970-01-01')
);
INSERT INTO db_version (db_version) VALUES ('1970-01-01');

DO $$
DECLARE new_version DATE;
BEGIN
  new_version := '2020-06-25' ;
  UPDATE db_version SET db_version = new_version;
END $$;

ALTER TABLE events ADD COLUMN end_time TIMESTAMP NOT NULL DEFAULT ('1970-01-01 00:00:00');

UPDATE events SET end_time = start_time + interval '1 hour' WHERE end_time = '1970-01-01 00:00:00';
