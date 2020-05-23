import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import EventsTable from "./components/EventsTable";
import UpcomingEvent from "./components/UpcomingEvent";
import AirtableApi from "./airtable/api";


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
      const records = await AirtableApi.getUserByEmail(user.email);
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
            (此处时间是您的当地时间)
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

ReactDOM.render(<EventRegion />, document.getElementById("event-region"));