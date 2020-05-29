DROP TABLE user_event;
DROP TABLE events;
DROP TABLE users;
DROP TYPE event_category;

-- CREATE EXTENSION pgcrypto; (require superuser)

CREATE TYPE event_category AS ENUM (
  '新人介绍课程',
  '线上Circling',
  '线下活动',
  '亚隆团体',
  '付费活动'
);

CREATE TABLE events (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar,
	max_attendees		int,
	category	event_category,
	host varchar,
  event_link text,
  start_time timestamp,
  fields JSONB
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar NOT NULL UNIQUE,
  CHECK (email <> ''),
  name varchar NOT NULL,
  CHECK (name <> ''),
  sent_first_event_email int DEFAULT 0 NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL,
  mobile varchar,
  wechat_id varchar
);

CREATE TABLE user_event (
  user_id UUID,
  event_id UUID,
  CONSTRAINT user_event_pk PRIMARY KEY (user_id, event_id)
);