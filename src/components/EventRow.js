import React from 'react';
import OfflineEventModal from './OfflineEventsModal';
import isMobilePhone from 'validator/lib/isMobilePhone';
import isWechatHandle from '../utils/isWechatHandle';
import AirtableAPI from "../airtable/api";
import Spinner from 'react-bootstrap/Spinner';

import AttendeesCell from './AttendeesCell';
import {joinEvent, unjoinEvent} from '../circling-api/index';
import Event from '../models/Event';

class EventRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showOfflineEventModal: false,
      wechatUserName: props.userWechatUserName || '',
      mobileNumber: props.mobileNumber || '',
      showModalAlert: false,
    };
  }

  handelJoinEventGateway = async (e) => {
    e.preventDefault();

    const event = new Event(this.props.eventJson);
    
    if (event.isOfflineEvent()) {
      return this.showOfflineEventModal();
    } 

    return this.handleJoinEvent();
  };

  dismissOfflineEventModal = () => {
    this.setState({showOfflineEventModal: false, showModalAlert: false});
  };

  showOfflineEventModal = () => {
    this.setState({showOfflineEventModal: true});
  };

  handleWechatUserNameChange = (e) => {
    e.preventDefault();
    this.setState({ wechatUserName: event.target.value });  
  }

  handleMobileNumberChange = (e) => {
    e.preventDefault();
    this.setState({ mobileNumber: event.target.value });  
  }

  handleJoinOfflineEvent = async() => {
    if (this.state.isLoading) {
      return;
    }

    const airbaseUserId = "TODO - FIX THIS";
    //can't join unless logged in
    if (!this.props.userId) {
      return;
    }

    if (!isMobilePhone(this.state.wechatUserName, 'any') && 
        !isWechatHandle(this.state.wechatUserName) || (!isMobilePhone(this.state.mobileNumber)))  {
      this.setState({ showModalAlert: true });
      return;
    }

    this.setState({ isLoading: true });

    const user = await AirtableAPI.getUser(airbaseUserId);
 
    const event = this.props.eventJson;

    const fields = user.fields;
    fields.WechatUserName = this.state.wechatUserName;
    fields.Mobile = this.state.mobileNumber;

    const [updatedUser, updatedEvents] = await Promise.all([
      AirtableAPI.updateUser(airbaseUserId, fields),
      joinEvent(event, airbaseUserId),
    ]); 

    this.props.onEventChanged(updatedEvents[0]);

    this.setState({ 
      isLoading: false,
      showModalAlert: false, 
      showOfflineEventModal: false 
    });
  }

  handleJoinEvent = async () => {
    if (this.state.isLoading) {
      return;
    }

    if (!this.props.userId) {
      window.netlifyIdentity.open();
      return;
    }

    this.setState({ isLoading: true });
  
    joinEvent(this.props.eventJson, this.props.userId)
      .then((results) => {
        console.log("join result", results);
        if (results.event) {
          this.props.onEventChanged(results.event);
        }
      })
      .finally(() => {
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

    unjoinEvent(this.props.eventJson, this.props.userId)
      .then((result) => {
        if (result.event) {
          this.props.onEventChanged(result.event);
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

    const joined = event.isUserAttending(this.props.userId);

    if (!joined) {
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
      joinButton = event.isOfflineEvent() ? (
        <span className="join-button w-button" onClick={this.showOfflineEventModal}>活动详情</span>
      ) : (
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
        <OfflineEventModal 
          eventJson={event.toJSON()} 
          show={this.state.showOfflineEventModal}
          showAlert={this.state.showModalAlert}
          onHide={this.dismissOfflineEventModal}
          wechatUserName={this.state.wechatUserName}
          onWechatUserNameChange={this.handleWechatUserNameChange}
          mobileNumber={this.state.mobileNumber}
          onMobileNumberChange={this.handleMobileNumberChange}
          onJoinOfflineEvent={this.handleJoinOfflineEvent}
          joined={joined}
        />

        <div className="schedule-columns w-row">
          <div className="w-col w-col-9 w-col-small-6 w-col-tiny-6 w-col-medium-9">
            <div className="w-col w-col-4 w-col-medium-4">
              <div>{event.startTimeDisplay()}</div>
            </div>
            <div className="w-col w-col-3 w-col-medium-3">
              {this.props.eventJson.name}
            </div>
            <div className="w-col w-col-3 w-col-medium-3">
              <a href={"/pages/leaders/#" + this.props.eventJson.host}
                className="join-button host">{this.props.eventJson.host}
              </a>
            </div>
            <AttendeesCell event={event} displayLength={10} />
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

export default EventRow;