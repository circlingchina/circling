
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

ALTER TABLE "public"."events" ADD COLUMN  "create_at" timestamp with time zone;
COMMENT ON COLUMN "public"."events"."create_at" IS '创建时间';

ALTER TABLE "public"."events" ALTER COLUMN "create_at" SET DEFAULT now();

# 增加开放时间
ALTER TABLE "public"."events" ADD COLUMN  "open_time" timestamp with time zone NOT NULL DEFAULT now();
COMMENT ON COLUMN "public"."events"."open_time" IS '开放时间';
