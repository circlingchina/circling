import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import EventsTable from "./components/EventsTable";
import UpcomingEvent from "./components/UpcomingEvent";
import api from "./circling-api";
import { Calendar, momentLocalizer } from "react-big-calendar"; //docs for calendar: http://jquense.github.io/react-big-calendar/examples/index.html
import moment from "moment";
import Event from "./models/Event";
import { TIME_ZONE } from "./utils/readableTimeString";

function convertToCalendarEvents(events, userId) {
  //right now we return some fake events, but what we need to do is to covert events into the format the calendar needs
  const calEvents = events.map((event) => {
    const eventObj = new Event(event);
    return {
      start: new Date(event.start_time),
      end: new Date(event.end_time),
      title: event.name,
      resource: eventObj.isUserAttending(userId),
    };
  });
  return calEvents;
}

function EventRenderer({ event, children }) {
  return (
    <div className={event.resource ? "attending" : "not-attending"}>
      {children}
    </div>
  );
}

const MyCalendar = ({ events }) => (
  <div>
    <Calendar
      localizer={momentLocalizer(moment().tz(TIME_ZONE))}
      defaultDate={new Date()}
      defaultView="week"
      events={events}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 500 }}
      selectable={false}
      components={{
        eventWrapper: EventRenderer,
      }}
    />
  </div>
);

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
    const newEvents = events.map((event) => {
      return event.id == changedEvent.id ? changedEvent : event;
    });
    setEvents(newEvents);
  };

  window.netlifyIdentity.on("login", async (netiflyUser) => {
    const result = await api.findUserByEmail(netiflyUser.email);
    if (result.user) {
      setUser(result.user);
    } else {
      throw Error(`${netiflyUser.email} not found in user db!`);
    }
  });

  window.netlifyIdentity.on("logout", () => {
    setUser({});
  });

  const updateUser = (user) => {
    setUser(user);
  };

  return (
    <>
      <div id="modal-root"></div>
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
          <div className="sub-text red">本周会员Circling</div>
          <div className="CalendarApp">
            <MyCalendar events={convertToCalendarEvents(events, user.id)} />
          </div>
          <EventsTable
            events={events}
            user={user}
            onEventChanged={updateEvents}
            onUserChanged={updateUser}
          />
        </div>
        <div className="page-divider">
          <div className="page-divider-white down" />
        </div>
      </div>
    </>
  );
}

ReactDOM.render(<EventRegion />, document.getElementById("event-region"));
