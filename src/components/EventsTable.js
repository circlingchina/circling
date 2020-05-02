import React from 'react';
import {joinEvent, unjoinEvent} from '../circling-api/index';
// import {joinEvent, unjoinEvent} from '../circling-api/serverless';
import moment from 'moment';
import locale from 'moment/src/locale/zh-cn';
import Event from '../models/Event';

import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from 'react-loader-spinner';

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
      userId={props.userId}
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
    isLoading: false,
  };

  handleJoinEvent = async (e) => {
    e.preventDefault();

    if (this.state.isLoading) {
      return;
    }

    if (!this.props.userId) {
      window.netlifyIdentity.open();
      return;
    }

    this.setState({ isLoading: true });
  
    joinEvent(this.props.eventJson, this.props.userId).then((updatedEvents) => {
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
    if (!this.props.userId) {
      return;
    }

    this.setState({ isLoading: true });

    unjoinEvent(this.props.eventJson, this.props.userId).then((updatedEvent) => {
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

    if (!event.containsUser(this.props.userId)) {
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
        <div className="w-col w-col-3">
          <div>
            <div>{timeStr}</div>
          </div>
        </div>
        <div className="w-col w-col-3">
          <div>{this.props.eventJson.fields.Category}</div>
        </div>
        <div className="w-col w-col-3">
          <a href={"/pages/leaders/#" + this.props.eventJson.fields.Host}
            className="join-button host">{this.props.eventJson.fields.Host}
          </a>
        </div>
        <div className="w-col w-col-3">
          <div>
            {event.getUsers().length}/{this.props.eventJson.fields.MaxAttendees}
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
