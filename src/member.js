"use strict";

import React from "react";
import ReactDOM from "react-dom";
var moment = require('moment');
import locale from 'moment/src/locale/zh-cn'
var Airtable = require("airtable");
var base = new Airtable({ apiKey: "keyN6C9ddDWd2YTGi" }).base(
  "app53ecZ2UL9M6JOw"
);

function getAirbaseUserId() {
  return window.airbaseUserId || window.localStorage.getItem('airbaseUserId')
}

// events table in member page 
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

class EventRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = { joined: false, full: false, timeUntil: false, attendees: this.props.event.fields.Attendees }

    this.handleJoinEvent = this.handleJoinEvent.bind(this)
  }

  componentDidMount() {

    //1. check if user is already in this event
    let userJoined = false
    // window.airbaseUserId = "recwLANU5KpoOSinS"
    console.log("Event.Users", this.props.event.fields.Users)
    if (this.props.event.fields.Users) {
      console.log("airbaseId", getAirbaseUserId())
      if (this.props.event.fields.Users.includes(getAirbaseUserId())) {
        userJoined = true;
      }
    }

    //2. check if event is full
    // this.props.event attendees and max attendees , if equal, full
    let roomfull = false
    if (this.props.event.attendees = this.props.event.MaxAttendees) {
      roomfull = true;
    }

    let timeUntil = false
    const dateNow = new Date()
    const eventDate = new Date(this.props.event.get("Time"))
    const msDiff = eventDate - dateNow
    const diffMin = msDiff / 1000 / 60;
    const diffHour = diffMin / 60;
    console.log("minuteDiff", diffMin);
    console.log("hourDiff", diffHour);
    console.log("event date", eventDate)

    if (diffHour > 2) {
      timeUntil = "before";
    } else {
      if (diffMin > 15) {
        timeUntil = "soon";
      } else {
        if (diffMin < 15 && diffHour > -2) {
          timeUntil = "now";
        } else {
          timeUntil = "past";
        };
      };
    };

    this.setState({
      joined: userJoined,
      full: roomfull,
      timeUntil: timeUntil
    }) //will auto call render()
  }

  handleJoinEvent(e) {
    e.preventDefault();
    let airbaseUserId = getAirbaseUserId();
    //can't join unless logged in
    if (!airbaseUserId) {
      return;
    }

    this.setState({ joined: true })
    let eventUsers = this.props.event.fields.Users ? this.props.event.fields.Users : []

    if (eventUsers.includes(airbaseUserId)) {
      return; //already joined
    }

    eventUsers.push(airbaseUserId)
    console.log("eventUsers", eventUsers)
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
        this.setState({ attendees: record.get('Attendees') })
      });
    });

  }

  render() {
    moment.locale("zh-cn", locale);
    const timeStr = moment(this.props.event.get("Time")).format('YYYY年M月D日 Ah点mm分');

    //based on state, render the correct UI element
    let joinButton
    let cancelButton

    if (!this.state.joined) {
      if (this.state.roomfull) {
        joinButton = <a href="#" className="join-button cancel w-button">
          报名已满
                      </a>
      } else {
        if (this.state.timeUntil == "soon" || this.state.timeUntil == "before") {
          joinButton = <a href="#" className="join-button w-button"
            onClick={this.handleJoinEvent}>
            报名
                      </a>
        } else {
          joinButton = <a href="#" className="join-button cancel">
            报名截止
                      </a>
        };
      };
    } else {
      joinButton = <a href="#" className="join-button w-button">
                      进入房间
                    </a>

      if (this.state.timeUntil = "before") {
        cancelButton = <a href="#" className="join-button w-button"
          onClick={this.handleJoinEvent}>
          取消报名
                         </a>
      } else {
        cancelButton = <a></a>
      };
    };

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
            {joinButton}{cancelButton}
          </div>
        </div>
      </div>
    );
  }
}
