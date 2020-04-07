"use strict";

import React from "react";
import ReactDOM from "react-dom";
var Airtable = require("airtable");
var base = new Airtable({ apiKey: "keyN6C9ddDWd2YTGi" }).base(
  "app53ecZ2UL9M6JOw"
);

class EventsTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      events: [],
    };
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  componentDidMount() {
    let allEvents = []
    base("OpenEvents")
      .select({
        // Selecting the first 3 records in Grid view:
        view: "Grid view",
      })
      .eachPage(
        (records, fetchNextPage) => {
          console.log(records)
          // This function (`page`) will get called for each page of records.
          allEvents = allEvents.concat(records);
          console.log(allEvents)

          // To fetch the next page of records, call `fetchNextPage`.
          // If there are more records, `page` will get called again.
          // If there are no more records, `done` will get called.
          fetchNextPage();
        },
        (err) => {
          if (err) {
            this.setState({ error: err, isLoaded: false });
            return;
          } else {
            this.setState({
              events: allEvents,
              isLoaded: true,
            });
          }

        }
      );
  }

  render() {
    const { error, isLoaded, events } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
      console.log(this.state.events);
      const eventItems = this.state.events.map((event) => (
        <EventRow key={event.id} event={event} />
      ));
      return (
        <div className="div-block-11">
          <div>
            <EventTableHeader />
            {eventItems}
          </div>
        </div>
      );
    }
  }
}

ReactDOM.render(<EventsTable />, document.getElementById("react-table"));


class EventTableHeader extends React.Component {
  render() {
    return (
      <div className="schedule-title w-row">
        <div className="column w-col w-col-3">
          时间
              </div>
        <div className="w-col w-col-3">
          活动
              </div>
        <div className="w-col w-col-3">
          带领者
              </div>
        <div className="w-col w-col-3">
          人数
              </div>
        <div className="w-col w-col-3">
          报名
              </div>
      </div>
    )
  }
}
// console.log("go through babel js");
class EventRow extends React.Component {
  render() {
    return (
      <div>
        <div className="schedule-columns w-row">
          <div className="w-col w-col-3">
            <div>
              <div>{this.props.event.get("Time")}</div>
            </div>
          </div>
          <div className="w-col w-col-3">
            <div>{this.props.event.fields.Category}</div>
          </div>
          <div className="w-col w-col-3">
            <a href={"/pages/leaders/#" + this.props.event.fields.Host}>
              <div>{this.props.event.fields.Host}</div>
            </a>
          </div>
          <div className="w-col w-col-3">
            <div>{this.props.event.fields.Attendees}/{this.props.event.fields.MaxAttendees}</div>
          </div>
          <div className="w-col w-col-3">
            <a href="#" className="join-button w-button">
              报名
            </a>
          </div>
        </div>
      </div>
    );
  }
}
