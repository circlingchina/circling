## Email Feature List

1. 注册成功时，一封介绍邮件（含新人课链接）
2. 第一次报名成功时，确认邮件，包含技术指导（瞩目的使用介绍，生日圈的画廊/演讲者模式引导）
3. Circling即将开始两小时前，提醒邮件
4. Circling结束后，邀请加入章鱼分享心得？仅限新用户第一次参加活动后

The first email is implemented via netlify's confirmation email templates, and can be changed by modifying [/_email_templates/confirm.html]

Assuming we have some /send_event_mail endpoint, there is probably a "right" and "quick" way to implement the second email:

quick - upon successfuly return from calling airtable_api.join(), call /send_event_mail on the client. This isn't ideal because the client shouldn't get access to directly trigger emails, and also this endpoint needs to check some state in airtable (is_first_email_sent?)

The 3rd and 4th email are implemented via cronjobs, checking every 15 minutes against the event database for events starting and ending soon.