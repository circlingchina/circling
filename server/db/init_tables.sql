DROP TYPE event_category;
DROP TABLE events;
DROP TYPE event_category;

CREATE TYPE event_category AS ENUM (
  '新人介绍课程',
  '线上Circling',
  '线下活动',
  '亚隆团体',
  '付费活动'
);

CREATE TABLE events (
	id		SERIAL,
  name varchar,
	max_attendees		int,
	category	event_category,
	host varchar,
  event_link text,
  start_time timestamp
);