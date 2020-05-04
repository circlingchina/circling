import React from 'react';
// import {joinEvent, unjoinEvent} from '../circling-api/index';
import {joinEvent, unjoinEvent} from '../circling-api/serverless';
import moment from 'moment';
import locale from 'moment/src/locale/zh-cn';
import Event from '../models/Event';

import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from 'react-loader-spinner';

function getAirbaseUserId() {
  return window.airbaseUserId || window.localStorage.getItem("airbaseUserId");
}

function EventsTable(props) {
  const futureEvents = props.events.filter((eventJson) => {
    const event = new Event(eventJson);
    return event.startingStatus() != Event.Status.FINISHED;    
  });

  const eventRows = futureEvents.map((eventJson) => (
    <EventRow
      key={eventJson.id}
      eventJson={eventJson}
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
}

function TableHeader() {
  return (
    <div className="schedule-title w-row events-table-header w-hidden-small">
      <div className="column w-col w-col-9 w-col-small-6">
        <div className="w-col w-col-4 w-col-medium-4">时间</div>
        <div className="w-col w-col-3 w-col-medium-3">活动</div>
        <div className="w-col w-col-3 w-col-medium-3">带领者</div>
        <div className="w-col w-col-2 w-col-medium-2">人数</div>
      </div>
      <div className="w-col w-col-3 w-col-medium-3">报名</div>
    </div>
  );
}

class EventRow extends React.Component {
  state = {
    isLoading: false,
  };

  handleJoinEvent = async (e) => {
    e.preventDefault();

    if (this.state.isLoading) {
      return;
    }

    const airbaseUserId = getAirbaseUserId();
    //can't join unless logged in
    if (!airbaseUserId) {
      return;
    }

    this.setState({ isLoading: true });
  
    joinEvent(this.props.eventJson, airbaseUserId).then((updatedEvents) => {
      if (updatedEvents && updatedEvents[0]) {
        this.props.onEventChanged(updatedEvents[0]);
      }
    }).finally(() => {
      this.setState({
        isLoading: false,
      });
    });
  };

  handleUnjoinEvent = async (e) => {
    e.preventDefault();

    if (this.state.isLoading) {
      return;
    }

    //can't unjoin unless logged in
    const airbaseUserId = getAirbaseUserId();
    if (!airbaseUserId) {
      return;
    }

    this.setState({ isLoading: true });

    unjoinEvent(this.props.eventJson, airbaseUserId).then((updatedEvent) => {
      if (updatedEvent) {
        this.props.onEventChanged(updatedEvent);
        this.setState({ isLoading: false });
      }
    }).finally(() => {
      this.setState({
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
    const timeStr = moment(this.props.eventJson.fields.Time)
      .format("YYYY年M月D日 Ah点mm分");   //based on state, render the correct UI element
    let joinButton;
    let cancelButton;
    const event = new Event(this.props.eventJson);

    if (!event.containsUser(getAirbaseUserId())) {
      if (event.isFull()) {
        joinButton = (
          <span className="join-button cancel w-button">报名已满</span>
        );
      } else {
        if (event.startingStatus() == Event.Status.STARTING_SOON || event.startingStatus() == Event.Status.NOT_STARTED) {
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
          onClick={(e) => this.handleOpenMeetingRoom(this.props.eventJson.fields.EventLink, e)}>

        进入房间</span>
      );

      if (event.startingStatus() == Event.Status.NOT_STARTED) {
        cancelButton = (
          <span className="join-button w-button" onClick={this.handleUnjoinEvent}>
            取消报名</span>
        );
      } else {
        cancelButton = <span></span>;
      }
    }

    if(this.state.isLoading) {
      joinButton = (<Loader
        type="Puff"
        color="#00BFFF"
        height={32}
        width={32}
      />);
      cancelButton = null;
    }
    return (
      <div className="schedule-columns w-row">
        <div className="w-col w-col-9 w-col-small-6 w-col-tiny-6 w-col-medium-9">
          <div className="w-col w-col-4 w-col-medium-4">
              <div>{timeStr}</div>
          </div>
          <div className="w-col w-col-3 w-col-medium-3">
            {this.props.eventJson.fields.Category}
          </div>
          <div className="w-col w-col-3 w-col-medium-3">
            <a href={"/pages/leaders/#" + this.props.eventJson.fields.Host}
              className="join-button host">{this.props.eventJson.fields.Host}
            </a>
          </div>
          <div className="w-col w-col-2 w-col-medium-2">
              {event.getUsers().length}/{this.props.eventJson.fields.MaxAttendees}
          </div>
        </div>
        <div className="w-col w-col-3 w-col-medium-3 w-col-small-5 w-col-tiny-5 align-middle">
          {joinButton}
          {cancelButton}
        </div>
      </div>
    );
  }
}
export default EventsTable;
