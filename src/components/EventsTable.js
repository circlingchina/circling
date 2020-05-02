import React from 'react';

// import {joinEvent, unjoinEvent} from '../circling-api/index';
import {joinEvent, unjoinEvent} from '../circling-api/serverless';
import moment from 'moment';
import locale from 'moment/src/locale/zh-cn';

function getAirbaseUserId() {
  return window.airbaseUserId || window.localStorage.getItem("airbaseUserId");
}

function getTimeUntil(event) {
  let timeUntil = false;
  const dateNow = new Date();
  const eventDate = new Date(event.fields.Time);
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
      }
    }
  }

  return timeUntil;
}

// events table in member page
function EventsTable(props) {
  const futureEvents = props.events.filter((event) => {
    const timeUntil = getTimeUntil(event);
    // if event.date is in the future
    if (timeUntil == "past") {
      return false;
    } 
    return true;
    
  });


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
    <div className="schedule-title w-row events-table-header">
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
    isLoading: false,
  };

  _updateStates(updatedEvent) {
    // After the final user unjoin the event, the updated event doesn't have the 'Users' property.
    // So make the joined false by default.
    let joined = false;
    console.log(updatedEvent);
    if (updatedEvent.fields.Users){
      joined = updatedEvent.fields.Users.includes(airbaseUserId);
    }
    this.setState({
      attendees: updatedEvent.fields.Attendees,
      joined,
      full: updatedEvent.fields.Attendees >= updatedEvent.fields.MaxAttendees,
    });
  }

  componentDidMount() {
    //1. check if user is already in this event
    let userJoined = false;
    if (this.props.event.fields.Users) {
      if (this.props.event.fields.Users.includes(getAirbaseUserId())) {
        userJoined = true;
      }
    }

    //2. check if event is full
    // this.props.event attendees and max attendees , if equal, full
    const roomfull = this.props.event.fields.Attendees >= this.props.event.fields.MaxAttendees;

    const timeUntil = getTimeUntil(this.props.event);

    this.setState({
      joined: userJoined,
      full: roomfull,
      timeUntil: timeUntil,
    });
  }

  handleJoinEvent = async (e) => {
    e.preventDefault();

    if (this.state.isLoading) {
      return;
    }

    this.setState({ isLoading: true });

    const airbaseUserId = getAirbaseUserId();
    //can't join unless logged in
    if (!airbaseUserId) {
      return;
    }

    const oldJoinState = this.state.joined;

    joinEvent(this.props.event, airbaseUserId).then((updatedEvents) => {
      if (updatedEvents && updatedEvents[0]) {
        this._updateStates(updatedEvents[0]);
        this.props.onEventChanged(updatedEvents[0]);
      }
      this.setState({ isLoading: false });
    }, (error) => {
      console.error("error joining event", error);
      //reset the join state
      this.setState({
        joined: oldJoinState,
        isLoading: false,
      });
    });
  };

  handleUnjoinEvent = async (e) => {
    e.preventDefault();

    if (this.state.isLoading) {
      return;
    }

    this.setState({ isLoading: true });

    const airbaseUserId = getAirbaseUserId();
    //can't join unless logged in
    if (!airbaseUserId) {
      return;
    }

    const oldJoinState = this.state.joined;

    unjoinEvent(this.props.event, airbaseUserId).then((updatedEvent) => {
      console.log("unjoin", updatedEvent);
      if (updatedEvent) {
        this._updateStates(updatedEvent);
        this.props.onEventChanged(updatedEvent);
        this.setState({ isLoading: false });
      }
    }, (error) => {
      console.log(error);
      this.setState({
        joined: oldJoinState,
        isLoading: false,
      });
    });
  };

  handleOpenMeetingRoom = (url, e) => {
    e.preventDefault();
    window.open(url);
  }

  render() {
    moment.locale("zh-cn", locale);
    const timeStr = moment(this.props.event.fields.Time)
      .format("YYYY年M月D日 Ah点mm分");   //based on state, render the correct UI element
    let joinButton;
    let cancelButton;


    // TODO test animation
    if (!this.state.joined) {
      if (this.state.full) {
        joinButton = (
          <span className="join-button cancel w-button">报名已满</span>
        );
      } else {
        if (this.state.timeUntil == "soon" || this.state.timeUntil == "before") {
          joinButton = (
            <span className="join-button w-button" onClick={this.handleJoinEvent}>报名</span>
          );
        } else {
          joinButton = (
            <span className="join-button cancel">报名截止</span>
          );
        }
      }
    } else {
      joinButton = (
        <span className="join-button w-button"
          onClick={(e) => this.handleOpenMeetingRoom(this.props.event.fields.EventLink, e)}>

        进入房间</span>
      );

      if ((this.state.timeUntil == "before")) {
        cancelButton = (
          <span className="join-button w-button" onClick={this.handleUnjoinEvent}>
            取消报名</span>
        );
      } else {
        cancelButton = <span></span>;
      }
    }

    return (
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
    );
  }

}
export default EventsTable;
