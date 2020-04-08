"use strict";

import React from "react";
import ReactDOM from "react-dom";
var moment = require('moment');
import locale from 'moment/src/locale/zh-cn'
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
    console.log("fetching event table")
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
  constructor(props) {
    super(props);
    this.handleJoinEvent = this.handleJoinEvent.bind(this)
    this.state = {joined: false, attendees: this.props.event.fields.Attendees}
  }

  handleJoinEvent(e) {

    e.preventDefault();
    if(!window.airbaseUserId) {
      return;
    }

    console.log("joining for " + window.airbaseUserId)
    this.setState({joined: true})
    let eventUsers = [window.airbaseUserId]
    if(this.props.event.fields.Users) {
      eventUsers = eventUsers.concat(this.props.event.fields.Users)
    }
    
    console.log("eventUsers=", eventUsers)

    base('OpenEvents').update([
      {
        "id": this.props.event.id,
        "fields": {
          "Users": eventUsers
        }
      }
    ], (err, records) => {
      if (err) {
        console.error(err);
        return;
      }
      records.forEach((record) => {
        console.log(record.get('Attendees'));
        this.setState({attendees: record.get('Attendees')})
      });
    });
    
  }

  render() {
    moment.locale("zh-cn", locale);
    const timeStr = moment(this.props.event.get("Time")).format('YYYY年M月D日 Ah点mm分');
    let joinButton
    if(!this.state.joined) {
      joinButton = <a href="#" className="join-button w-button"
                      onClick={this.handleJoinEvent}>
                      报名
                    </a>
    } else {
      joinButton = "已报名"
    }
    return (
      <div>
        <div className="schedule-columns w-row">
          <div className="w-col w-col-3">
            <div>
              <div>
                {
                  timeStr
                  
                }
              </div>
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
            <div>{this.state.attendees}/{this.props.event.fields.MaxAttendees}</div>
          </div>
          <div className="w-col w-col-3">
            {joinButton}
          </div>
        </div>
      </div>
    );
  }
}
