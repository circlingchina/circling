import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import EventsTable from "./components/EventsTable";
import UpcomingEvent from "./components/UpcomingEvent";
import api from "./circling-api";

function EventRegion() {

  const [events, setEvents] = useState([]);
  const [user, setUser] = useState({}); //empty object to be back-compatible (i.e can always call user.id, even if id is null)

  useEffect(() => {
    (async () => {
      const allEvents = await api.getEvents();
      setEvents(allEvents);
    })();

    // TODO - figure out why we needed polling and elimiate it by providing better backend
    // Polling for latest states
    // const interval = setInterval(async() => await refreshEvents(), 10000);
    // return (() => clearInterval(interval));
  }, []);
  
  const updateEvents = (changedEvent) => {
    const newEvents = events.map((event)=> {
      return event.id == changedEvent.id ? changedEvent : event;
    });
    setEvents(newEvents);
  };
  
  window.netlifyIdentity.on('login', async (netiflyUser) => {
    const result = await api.findUserByEmail(netiflyUser.email);
    if(result.user) {
      setUser(result.user);
    } else {
      throw Error(`${netiflyUser.email} not found in user db!`);
    }
  });

  window.netlifyIdentity.on('logout', () => {
    setUser({});
  });

  return (
    <>
      <div id='modal-root'></div>
      <div className="section">
        <div className="container w-container">
          <UpcomingEvent events={events} userId={user.id} />
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
          <EventsTable events={events} user={user} onEventChanged={updateEvents} />
        </div>
        <div className="page-divider">
          <div className="page-divider-white down" />
        </div>
      </div>
    </>
  );
}

ReactDOM.render(<EventRegion />, document.getElementById("event-region"));