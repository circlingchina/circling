import React from "react";
import Event from "../models/Event";
import _ from "lodash";
import readableTimeString from '../utils/readableTimeString';

function UpcomingEvent({events, userId}) {
  const myEvents = events.filter((event) => {
    return event.attendees.map(user=>user.id).includes(userId);
  });

  const startingEvents = myEvents.filter((event) => {
    const eventObj = new Event(event);
    return eventObj.isStartingSoon();
  });

  // console.log(myEvents.map(e=> (new Event(e)).startingStatus()), startingEvents);
  startingEvents.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  let startingSoonEvent = _.head(startingEvents);

  if(!startingSoonEvent) {
    return <div className="sub-text red">没有即将开始的活动</div>;
  }

  return (
    <>
      <div className="sub-text red">即将开始</div>
      <div className="div-block-13">
        <div className="sub-text black">{startingSoonEvent.name}</div>
        <div className="sub-text black">开始时间：{readableTimeString(startingSoonEvent.start_time)}</div>
        <div className="sub-text black">带领者：{startingSoonEvent.host}</div>
        <a href={startingSoonEvent.event_link} className="button w-button" target="_blank" rel="noopener noreferrer">
          点击进入
        </a>
        <a href="/pages/whatiscircling2">查看我需要准备什么</a>
      </div>
    </>
  );
}

export default UpcomingEvent;
