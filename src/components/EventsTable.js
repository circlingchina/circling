import React from 'react';

import classNames from 'classnames';
import Spinner from 'react-bootstrap/Spinner';
import Popover from 'react-bootstrap/Popover';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

// import {joinEvent, unjoinEvent} from '../circling-api/index';
import {joinEvent, unjoinEvent} from '../circling-api/serverless';
import Event from '../models/Event';
import OfflineEventModal from './OfflineEventsModal';

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

function JoinerCountCell(props) {
  const spanEl = (
    <span className={classNames({underline: !props.event.isEmpty()})}>
      {props.event.getUsers().length}/{props.event.toJSON().fields.MaxAttendees}
    </span>
  );

  let joinedUsers = props.event.toJSON().fields.UsersExtra;

  let needEllipses = false;
  if (joinedUsers.length > props.displayLength) {
    joinedUsers = joinedUsers.slice(0, props.displayLength);
    needEllipses = true;
  }

  const userList = [];
  for (const user of joinedUsers) {
    userList.push(<span key={user.id}>{user.Name}<br /></span>);
  }
  if (needEllipses) {
    userList.push('...');
  }

  const popover = (
    <Popover id={'popover-joiners-' + props.event.toJSON().id}>
      <Popover.Content>
        {userList}
      </Popover.Content>
    </Popover>
  );

  let spanWrapper;
  if (props.event.isEmpty()) {
    spanWrapper = spanEl;
  } else {
    spanWrapper = (
      <OverlayTrigger trigger={['hover', 'focus']} placement="right" overlay={popover}>
        {spanEl}
      </OverlayTrigger>
    );
  }

  return(
    <div className="w-col w-col-2 w-col-medium-2">
      {spanWrapper}
    </div>
  );
}

class EventRow extends React.Component {
  state = {
    isLoading: false,
    showOfflineEventModal: false
  };

  handelJoinEventGateway = async (e) => {
    e.preventDefault();
    const event = new Event(this.props.eventJson);
    
    if (event.isOfflineEvent()) {
      return this.toggleShowOfflineEventModal();
    } 
    return this.handleJoinEvent();
  };

  toggleShowOfflineEventModal = () => {
    this.setState({showOfflineEventModal: !this.state.showOfflineEventModal});
  };



  handleJoinEvent = async () => {
    
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

    unjoinEvent(this.props.eventJson, airbaseUserId).then((updatedEvents) => {
      if (updatedEvents) {
        this.props.onEventChanged(updatedEvents[0]);
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
            <span className="join-button w-button" onClick={this.handelJoinEventGateway}>报名</span>
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
      joinButton = (
        <Spinner animation="border" variant="danger" />
      );
      cancelButton = null;
    }


    return (
      <>
        <OfflineEventModal event={event} show={this.state.showOfflineEventModal}
          onHide={this.toggleShowOfflineEventModal}
        />
        <div className="schedule-columns w-row">
          <div className="w-col w-col-9 w-col-small-6 w-col-tiny-6 w-col-medium-9">
            <div className="w-col w-col-4 w-col-medium-4">
              <div>{event.startTimeDisplay()}</div>
            </div>
            <div className="w-col w-col-3 w-col-medium-3">
              {this.props.eventJson.fields.Name}
            </div>
            <div className="w-col w-col-3 w-col-medium-3">
              <a href={"/pages/leaders/#" + this.props.eventJson.fields.Host}
                className="join-button host">{this.props.eventJson.fields.Host}
              </a>
            </div>
            <JoinerCountCell event={event} displayLength={10} />
          </div>
          <div className="w-col w-col-3 w-col-medium-3 w-col-small-5 w-col-tiny-5 align-middle">
            {joinButton}
            {cancelButton}
          </div>
        </div>
      </>
    );
  }
}
export default EventsTable;
