/* 请确认以下SQL符合您的变更需求，务必确认无误后再提交执行 */

CREATE TABLE "public"."qa_post"
(
 "id" uuid NOT NULL DEFAULT gen_random_uuid() ,
 "subject" varchar ,
 "title" varchar ,
 "content" text ,
 "update_at" timestamp with time zone DEFAULT now() ,
CONSTRAINT "pk_public_qa_post" PRIMARY KEY ("id") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
ALTER TABLE "public"."qa_post" OWNER TO circling;
