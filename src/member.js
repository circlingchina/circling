

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import EventsTable from "./components/EventsTable";
import UpcomingEvent from "./components/UpcomingEvent";
import AirtableApi from "./airtable/api";

require('dotenv').config();
function getAirbaseUserId() {
  return window.airbaseUserId || window.localStorage.getItem("airbaseUserId");
}
// TODO (Yiliang): move components to separate files

function EventRegion() {
  const storedUserId = window.localStorage.getItem("lastUserId");
  const [events, setEvents] = useState([]);
  const [userId, setUserId] = useState(storedUserId);
  useEffect(() => {
    async function refreshEvents() {
      try {
        const allEvents = await AirtableApi.getAllEventsWithUsers();
        setEvents(allEvents);
      } catch (err) {
        console.error(err);
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
  
  //listen to login and logout events
  window.netlifyIdentity.on('login', async (user) => {
    //new users should have airtable_id saved in metadata from the netlify function
    //development HACK: skip this step because the development airtable.base has a different set of IDs, so we always have to fetch
    if(user && user.user_metadata.airtable_id && process.env.NODE_ENV == "production") {
      setUserId(user.user_metadata.airtable_id);
    } else {
      // back-compat: grab from airtable
      const records = await AirtableApi.getAirtableUser(user.email);
      if(records.length > 0) {
        setUserId(records[0].id);
      }
    }
  });

  window.netlifyIdentity.on('logout', () => {
    setUserId(null);
  });

  return (
    <>
      <div id='modal-root'></div>
      <div className="section">
        <div className="container w-container">
          <UpcomingEvent events={events} userId={userId} />
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
          <EventsTable events={events} userId={userId} onEventChanged={updateEvents} />
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
        <a href={startingSoonEvent.fields.EventLink} className="button w-button" target="_blank" rel="noopener noreferrer">
          点击进入
        </a>
        <a href="/pages/whatiscircling2">查看我需要准备什么</a>
      </div>
    </>
  );
}

