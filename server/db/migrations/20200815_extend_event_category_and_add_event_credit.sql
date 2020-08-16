DO $$
DECLARE new_version DATE;
BEGIN
  new_version := '2020-08-15' ;
  UPDATE db_version SET db_version = new_version;
END $$;

ALTER TABLE users ADD COLUMN event_credit INTEGER NOT NULL DEFAULT 0;


ALTER TYPE event_category ADD VALUE 'Circling周边游戏';

ALTER TYPE event_category RENAME VALUE  '线上Circling' TO 'Circling';
ALTER TYPE event_category RENAME VALUE  '亚隆团体' TO '社群自发活动';

ALTER TYPE event_category RENAME VALUE  '付费活动' TO '付费活动 - deprecated';

