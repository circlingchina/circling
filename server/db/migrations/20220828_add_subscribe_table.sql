/* 创建订阅表 */
CREATE TABLE "public"."user_event_subscribe"
(
 "event_id" uuid NOT NULL ,
 "user_id" uuid NOT NULL ,
 "create_at" timestamp with time zone NOT NULL DEFAULT now() ,
 "status" integer NOT NULL DEFAULT 0 ,
 "open_id" varchar ,
 "content" text ,
 "result" text ,
 "update_at" timestamp with time zone ,
CONSTRAINT "pk_public_user_event_subscribe" PRIMARY KEY ("event_id","user_id","create_at") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
ALTER TABLE "public"."user_event_subscribe" OWNER TO circling;

/* users表增加open_id字段 */
ALTER TABLE "public"."users" ADD COLUMN  "open_id" varchar;