select id,name,category,host,start_time from events where id in (
select event_id from user_event where
user_id = '528abdcc-4440-4d40-8169-fb4a43873e00')
order by start_time;
