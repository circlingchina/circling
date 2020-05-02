import React from "react";
import moment from "moment";

function UpcomingEvent({events, userId}) {
  const myEvents = events.filter((event) => {

    const eventUsers = event.fields.Users;

    const eventDate = new Date(event.get("Time"));
    const diffHour = (eventDate - new Date()) / (1000 * 60 * 60);

    return userId && eventUsers && eventUsers.includes(userId) && (diffHour < 280 & diffHour > 0);
  })
    .sort((a, b) => new Date(a.get("Time")) - new Date(b.get("Time")));

  let startingSoonEvent = myEvents.length > 0 ? myEvents[0] : null;

  if(!startingSoonEvent) {
    return <div className="sub-text red">没有即将开始的活动</div>;
  }

  return (
    <>
      <div className="sub-text red">即将开始</div>
      <div className="div-block-13">
        <div className="sub-text black">{startingSoonEvent.fields.Name}</div>
        <div className="sub-text black">开始时间：{moment(startingSoonEvent.fields.Time).format("YYYY年M月D日 Ah点mm分")}</div>
        <div className="sub-text black">带领者：{startingSoonEvent.fields.Host}</div>
        <a href={startingSoonEvent.fields.EventLink} className="button w-button" target="_blank" rel="noopener noreferrer">
          点击进入
        </a>
        <a href="/pages/whatiscircling2">查看我需要准备什么</a>
      </div>
    </>
  );
}

export default UpcomingEvent;