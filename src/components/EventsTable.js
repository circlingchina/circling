import React from "react";
import Event from "../models/Event";
import EventRow from "./EventRow";

function EventsTable(props) {
  const futureEvents = props.events.filter((eventJson) => {
    const event = new Event(eventJson);
    return event.startingStatus() != Event.Status.FINISHED;
  });

  let numEvents = countUserEvents(props.events, props.user.id);

  const eventRows = futureEvents.map((eventJson) => (
    <EventRow
      key={eventJson.id}
      eventJson={eventJson}
      onEventChanged={props.onEventChanged}
      onUserChanged={props.onUserChanged}
      user={props.user}
      numEvents={numEvents}
    />
  ));

  return (
    <div className="div-block-11">
      <div>
        <TableHeader />
        {eventRows}
      </div>
    </div>
  );
}

function TableHeader() {
  return (
    <div className="schedule-title w-row events-table-header w-hidden-small">
      <div className="column w-col w-col-9 w-col-small-6">
        <div className="w-col w-col-4 w-col-medium-4">当地时间</div>
        <div className="w-col w-col-4 w-col-medium-4">活动</div>
        <div className="w-col w-col-2 w-col-medium-2">类别</div> 
        <div className="w-col w-col-1 w-col-medium-1">带领者</div>
        <div className="w-col w-col-1 w-col-medium-1">人数</div>
      </div>
      <div className="w-col w-col-3 w-col-medium-3">报名</div>
    </div>
  );
}

function countUserEvents(events, userId) {
  let numEvents = 0;
  events.filter((eventJson) => {
    const event = new Event(eventJson);
    if (event.isUserAttending(userId)) {
      numEvents += 1;
    }
  });
  return numEvents;
}

export default EventsTable;
