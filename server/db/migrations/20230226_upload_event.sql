
ALTER TABLE "public"."events" ADD COLUMN  "leader_id" uuid;
COMMENT ON COLUMN "public"."events"."leader_id" IS '带领者id';
ALTER TABLE "public"."events" ADD COLUMN  "supervisor" varchar;
COMMENT ON COLUMN "public"."events"."supervisor" IS '协助者';
ALTER TABLE "public"."events" ADD COLUMN  "event_account" varchar;
COMMENT ON COLUMN "public"."events"."event_account" IS '账号名称';


ALTER TABLE "public"."users" ADD COLUMN  "is_leader" integer NOT NULL DEFAULT 0;
COMMENT ON COLUMN "public"."users"."is_leader" IS '是否是带领者';
ALTER TABLE "public"."users" ADD COLUMN  "is_manager" integer NOT NULL DEFAULT 0;
COMMENT ON COLUMN "public"."users"."is_manager" IS '是否是管理员';

# 增加内部活动类型
ALTER TYPE event_category ADD VALUE '内部活动';