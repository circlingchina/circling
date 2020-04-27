

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import EventsTable from "./components/EventsTable";
import AirtableApi from "./airtable/api";
import moment from "moment";


function getAirbaseUserId() {
  return window.airbaseUserId || window.localStorage.getItem("airbaseUserId");
}

function EventRegion() {
  const [events, setEvents] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    async function refreshEvents() {
      if (isLoaded) {
        return;
      }
      
      try {
        const allEvents = await AirtableApi.getAllEvents();
        setEvents(allEvents);
        setIsLoaded(true);
      } catch (err) {
        console.error(err);
        setIsLoaded(true);
      }
    }
    refreshEvents();
  }, []);
  
  const updateEvents = (changedEvent) => {
    const newEvents = events.map((event)=> {
      return event.id == changedEvent.id ? changedEvent : event;
    });
    setEvents(newEvents);
  };
  //TODO update parent when child changes event stuff (joine, unjoin)

  if (!isLoaded) {return (
    <div style={{
      margin: "0 auto",
      maxWidth: "fit-content",
      textAlign: "right"
    }}>
      <span>给自己几次深呼吸吧!</span><br/>
      <span> - Milk </span>
    </div>
  );}

  return (
    <>
      <div className="section">
        <div className="container w-container">
          <UpcomingEvent events={events} />
        </div>
        <div className="page-divider">
          <div className="page-divider-white down" />
        </div>
      </div>
      <div className="section transparent">
        <div className="container w-container">
          <div className="sub-text red">
            本周会员Circling
            <br />
          </div>
          <EventsTable events={events} onEventChanged={updateEvents} />
        </div>
        <div className="page-divider">
          <div className="page-divider-white down" />
        </div>
      </div>
    </>
  );
}

function UpcomingEvent({events}) {
  const myEvents = events.filter((event) => {
    const userId = getAirbaseUserId();
    const eventUsers = event.fields.Users;
    return userId && eventUsers && eventUsers.includes(userId);
  });

  let startingSoonEvent = null;

  if(myEvents.length > 0) {
    const nextEvent = myEvents[0];
    
    const eventDate = new Date(nextEvent.get("Time"));
    const diffHour = (eventDate - new Date()) / (1000 * 60 * 60);
    if (diffHour < 280) {
      startingSoonEvent = nextEvent;
    }
  }

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
        <a href={startingSoonEvent.fields.EventLink} className="button w-button" target="_blank">
          点击进入
        </a>
        <a href="/pages/whatiscircling2">查看我需要准备什么</a>
      </div>
    </>
  );
}

ReactDOM.render(<EventRegion />, document.getElementById("event-region"));
