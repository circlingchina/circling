"use strict";

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import EventsTable from "./components/EventsTable"
import AirtableApi from "./airtable_api.js";

function getAirbaseUserId() {
  return window.airbaseUserId || window.localStorage.getItem("airbaseUserId");
}

function EventRegion() {
  const [events, setEvents] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)
  
  useEffect(() => {
    //TODO fix loading twice (API call in useEffect pattern)
    if(isLoaded) return
    console.log("loading all events from API")
    AirtableApi.getAllEvents(
      (allEvents) => {
        setEvents(allEvents)
        setIsLoaded(true)
      },
      (err) => {
        setIsLoaded(true)
        return <div>Error: {error.message}</div>
      }
    );
  });
  
  const updateEvents = (changedEvent) => {
    const newEvents = events.map((event)=> {
      return event.id == changedEvent.id ? changedEvent : event
    })
    setEvents(newEvents)
  }
  //TODO update parent when child changes event stuff (joine, unjoin)

  if (!isLoaded) return <div>Loading...</div>

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
    const userId = getAirbaseUserId()
    const eventUsers = event.fields.Users
    return userId && eventUsers && eventUsers.includes(userId)
  })
  console.log("my events", myEvents)

  let startingSoonEvent = null;

  if(myEvents.length > 0) {
    const nextEvent = myEvents[0]
    
    const dateNow = new Date();
    const eventDate = new Date(nextEvent.get("Time"));
    const diffHour = (eventDate - new Date()) / (1000 * 60 * 60)
    console.log("diffHour", diffHour)
    if (diffHour < 280) {
      startingSoonEvent = nextEvent
    }
  }

  if(!startingSoonEvent) {
    return <div className="sub-text red">没有即将开始的活动</div>
  }

  return (
    <>
      <div className="sub-text red">即将开始</div>
      <div className="div-block-13">
        <div className="sub-text black">{startingSoonEvent.fields.Name}</div>
        <div className="sub-text black">开始时间：{startingSoonEvent.fields.Time}</div>
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
