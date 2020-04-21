import React from "react";
import AirtableApi from "../airtable_api.js";
const moment = require("moment");
import locale from "moment/src/locale/zh-cn";

function getAirbaseUserId() {
  return window.airbaseUserId || window.localStorage.getItem("airbaseUserId");
}

function getTimeUntil(event) {
  let timeUntil = false;
  const dateNow = new Date();
  const eventDate = new Date(event.get("Time"));
  const msDiff = eventDate - dateNow;
  const diffMin = msDiff / 1000 / 60;
  const diffHour = diffMin / 60;

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

  return timeUntil
}


// events table in member page
function EventsTable(props) {
  const futureEvents = props.events.filter((event) => {
    const timeUntil = getTimeUntil(event)
    console.log(event.get("Time"))
    console.log("timeUntil", timeUntil)
    // if event.date is in the future
    if (timeUntil == "past") {
      return false
    } else {
      return true
    }
  })

  console.log(futureEvents);

  // if (futureEvents){
  const eventRows = futureEvents.map((event) => (
    <EventRow
      key={event.id}
      event={event}
      onEventChanged={props.onEventChanged}
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
  // } else;
}

function TableHeader() {
  return (
    <div className="schedule-title w-row">
      <div className="column w-col w-col-3">时间</div>
      <div className="w-col w-col-3">活动</div>
      <div className="w-col w-col-3">带领者</div>
      <div className="w-col w-col-3">人数</div>
      <div className="w-col w-col-3">报名</div>
    </div>
  );
}

class EventRow extends React.Component {
  state = {
    joined: false,
    full: false,
    timeUntil: false,
    attendees: this.props.event.fields.Attendees,
  };

  componentDidMount() {
    //1. check if user is already in this event
    let userJoined = false;
    // window.airbaseUserId = "recwLANU5KpoOSinS"
    if (this.props.event.fields.Users) {
      if (this.props.event.fields.Users.includes(getAirbaseUserId())) {
        userJoined = true;
      }
    }

    //2. check if event is full
    // this.props.event attendees and max attendees , if equal, full
    const roomfull = this.props.event.fields.Attendees >= this.props.event.fields.MaxAttendees;

    const timeUntil = getTimeUntil(this.props.event)

    this.setState({
      joined: userJoined,
      full: roomfull,
      timeUntil: timeUntil,
    });
  }

  handleJoinEvent = (e) => {
    e.preventDefault();
    const airbaseUserId = getAirbaseUserId();
    //can't join unless logged in
    if (!airbaseUserId) {
      return;
    }

    const oldJoinState = this.state.joined;
    this.setState({ joined: true });

    AirtableApi.join(
      this.props.event,
      airbaseUserId,
      (updatedEvent) => {
        this.setState({ attendees: updatedEvent.get("Attendees") });
        if (this.state.full) {
          this.setState({ full: false });
        }
        this.props.onEventChanged(updatedEvent);
      },
      (err) => {
        console.log(err);
        //reset the join state
        this.setState({ joined: oldJoinState });
      }
    );
  };

  handleUnjoinEvent = (e) => {
    e.preventDefault();

    const airbaseUserId = getAirbaseUserId();
    //can't join unless logged in
    if (!airbaseUserId) {
      return;
    }

    const oldJoinState = this.state.joined;
    this.setState({ joined: false });

    AirtableApi.unjoin(
      this.props.event,
      airbaseUserId,
      (updatedEvent) => {
        this.setState({
          attendees: updatedEvent.get("Attendees"),
          joined: false,
        });
        this.props.onEventChanged(updatedEvent);
      },
      (err) => {
        console.log(err);
        this.setState({ joined: oldJoinState });
      }
    );
  };

  render() {
    moment.locale("zh-cn", locale);
    const timeStr = moment(this.props.event.get("Time"))
      .format("YYYY年M月D日 Ah点mm分");   //based on state, render the correct UI element
    let joinButton;
    let cancelButton;

    if (!this.state.joined) {
      if (this.state.full) {
        joinButton = (
          <a href="#" className="join-button cancel w-button">
            报名已满
          </a>
        );
      } else {
        if (
          this.state.timeUntil == "soon" ||
          this.state.timeUntil == "before"
        ) {
          joinButton = (
            <a
              href="#"
              className="join-button w-button"
              onClick={this.handleJoinEvent}
              onTouchStart={this.handleJoinEvent}
            >
              报名
            </a>
          );
        } else {
          joinButton = (
            <a href="#" className="join-button cancel">
              报名截止
            </a>
          );
        }
      }
    } else {
      joinButton = (
        <a
          href={this.props.event.fields.EventLink}
          className="join-button w-button"
          target="_blank"
        >
          进入房间
        </a>
      );

      if ((this.state.timeUntil = "before")) {
        cancelButton = (
          <a
            href="#"
            className="join-button w-button"
            onClick={this.handleUnjoinEvent}
            onTouchStart={this.handleUnjoinEvent}
          >
            取消报名
          </a>
        );
      } else {
        cancelButton = <a></a>;
      }
    }


    return (
      <div>
        <div className="schedule-columns w-row">
          <div className="w-col w-col-3">
            <div>
              <div>{timeStr}</div>
            </div>
          </div>
          <div className="w-col w-col-3">
            <div>{this.props.event.fields.Category}</div>
          </div>
          <div className="w-col w-col-3">
            <a href={"/pages/leaders/#" + this.props.event.fields.Host}
              className="join-button host">{this.props.event.fields.Host}
            </a>
          </div>
          <div className="w-col w-col-3">
            <div>
              {this.state.attendees}/{this.props.event.fields.MaxAttendees}
            </div>
          </div>
          <div className="w-col w-col-3">
            {joinButton}
            {cancelButton}
          </div>
        </div>
      </div>
    );
  }

}
export default EventsTable;
