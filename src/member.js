

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import EventsTable from "./components/EventsTable";
import AirtableApi from "./airtable/api";
import moment from "moment";
require('dotenv').config();


function getAirbaseUserId() {
  return window.airbaseUserId || window.localStorage.getItem("airbaseUserId");
}
// TODO (Yiliang): move components to separate files

function EventRegion() {
  const [events, setEvents] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    async function refreshEvents() {
      
      try {
        const allEvents = await AirtableApi.getAllEventsWithUsers();
        setEvents(allEvents);
        setIsLoaded(true);
      } catch (err) {
        console.error(err);
        setIsLoaded(true);
      }
    }
    refreshEvents();

    // Polling for latest states
    const interval = setInterval(async() => await refreshEvents(), 10000);
    return (() => clearInterval(interval));
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
        <a href={startingSoonEvent.fields.EventLink} className="button w-button" target="_blank">
          点击进入
        </a>
        <a href="/pages/whatiscircling2">查看我需要准备什么</a>
      </div>
    </>
  );
}

ReactDOM.render(<EventRegion />, document.getElementById("event-region"));
