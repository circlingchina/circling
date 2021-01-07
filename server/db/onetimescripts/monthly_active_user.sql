\f ','
\a
\t
\o /tmp/output.csv

select t.event_id, e.name, e.host, e.max_attendees, u.name as attendee_name, e.start_time
from
(select event_id, user_id from user_event
where event_id in  (
    select
    id
    from events
    where start_time >= '2020-11-01' and start_time <= '2020-12-31')
) t
join events e on e.id = t.event_id
join users u on u.id = t.user_id
order by e.start_time;
