CREATE OR REPLACE FUNCTION "public".cleanup_expired_precreate_users_after_5_mins() 
RETURNS trigger AS 
$BODY$
	
BEGIN
  DELETE FROM precreate_users WHERE created_at < NOW() - INTERVAL '3 days';
  RETURN NEW;
END;

$BODY$
LANGUAGE plpgsql;


ALTER TABLE "public"."user_event" ADD COLUMN  "create_at" timestamp with time zone DEFAULT now();