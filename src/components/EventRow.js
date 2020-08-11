import React from "react";
import OfflineEventModal from "./OfflineEventsModal";
import isMobilePhone from "validator/lib/isMobilePhone";
import isWechatHandle from "../utils/isWechatHandle";
import Spinner from "react-bootstrap/Spinner";

import AttendeesCell from "./AttendeesCell";
import api from "../circling-api/index";
import Event from "../models/Event";
import User from "../models/User";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

class EventRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showOfflineEventModal: false,
      wechatUserName: props.user.wechat_id || "", //TODO - check if empty string is necessary
      mobileNumber: props.user.mobile || "", //TODO - check if empty string is necessary
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
    this.setState({ showOfflineEventModal: false, showModalAlert: false });
  };

  showOfflineEventModal = () => {
    //show login modal instead of offline prompt if not logged in
    if (!this.props.user.id) {
      window.netlifyIdentity.open();
    } else {
      this.setState({ showOfflineEventModal: true });
    }
  };

  handleWechatUserNameChange = (e) => {
    e.preventDefault();
    this.setState({ wechatUserName: event.target.value });
  };

  handleMobileNumberChange = (e) => {
    e.preventDefault();
    this.setState({ mobileNumber: event.target.value });
  };

  handleJoinOfflineEvent = async () => {
    if (this.state.isLoading) {
      return;
    }

    const userId = this.props.user.id;

    //can't join unless logged in
    if (!userId) {
      return;
    }

    if (
      (!isMobilePhone(this.state.wechatUserName, "any") &&
        !isWechatHandle(this.state.wechatUserName)) ||
      !isMobilePhone(this.state.mobileNumber)
    ) {
      this.setState({ showModalAlert: true });
      return;
    }

    this.setState({ isLoading: true });

    const event = this.props.eventJson;

    const userParams = {
      wechat_id: this.state.wechatUserName,
      mobile: this.state.mobileNumber,
    };

    //first update the user info
    const updateUserResponse = await api.updateUser(userId, userParams);
    this.props.onUserChanged(updateUserResponse.user);

    //after user is updated, join offline event
    const joinResponse = await api.joinEvent(event, userId);
    this.props.onEventChanged(joinResponse.event);

    this.setState({
      isLoading: false,
      showModalAlert: false,
      showOfflineEventModal: false,
    });
  };

  maxedOut() {
    return this.props.numEvents >= 5;
  }

  handleJoinEvent = async () => {
    if (this.state.isLoading) {
      return;
    }

    const userId = this.props.user.id;
    if (!userId) {
      window.netlifyIdentity.open();
      return;
    }

    const userModel = new User(this.props.user);
    const event = new Event(this.props.eventJson);

    if (!userModel.isPremium() && !event.isTrail()) {
      window.location = "/pages/pricing";
      return;
    }

    if (this.maxedOut()) {
      toast.dark("不要太贪心哦,一次只能报5个活动");
      return;
    }
    this.setState({ isLoading: true });

    api
      .joinEvent(this.props.eventJson, userId)
      .then((results) => {
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
    if (!this.props.user.id) {
      return;
    }

    this.setState({ isLoading: true });

    api
      .unjoinEvent(this.props.eventJson, this.props.user.id)
      .then((result) => {
        if (result.event) {
          this.props.onEventChanged(result.event);
          this.setState({ isLoading: false });
        }
      })
      .finally(() => {
        this.setState({
          isLoading: false,
        });
      });
  };

  handleOpenMeetingRoom = (url, e) => {
    e.preventDefault();
    window.open(url);
  };

  render() {
    let joinButton;
    let cancelButton;
    const event = new Event(this.props.eventJson);

    const joined = event.isUserAttending(this.props.user.id);

    if (!joined) {
      if (event.isFull()) {
        joinButton = (
          <span className="join-button cancel w-button">报名已满</span>
        );
      } else {
        if (
          event.startingStatus() == Event.Status.STARTING_SOON ||
          event.startingStatus() == Event.Status.NOT_STARTED
        ) {
          joinButton = (
            <span
              className="join-button w-button"
              onClick={this.handelJoinEventGateway}
            >
              报名
            </span>
          );
        } else {
          joinButton = <span className="join-button cancel">报名截止</span>;
        }
      }
    } else {
      joinButton = event.isOfflineEvent() ? (
        <span
          className="join-button w-button"
          onClick={this.showOfflineEventModal}
        >
          活动详情
        </span>
      ) : (
        <span
          className="join-button w-button"
          onClick={(e) =>
            this.handleOpenMeetingRoom(this.props.eventJson.event_link, e)
          }
        >
          进入房间
        </span>
      );

      if (event.startingStatus() == Event.Status.NOT_STARTED) {
        cancelButton = (
          <span
            className="join-button w-button"
            onClick={this.handleUnjoinEvent}
          >
            取消报名
          </span>
        );
      } else {
        cancelButton = <span></span>;
      }
    }

    if (this.state.isLoading) {
      joinButton = <Spinner animation="border" variant="danger" />;
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
              <div>{event.durationDisplay()}</div>
            </div>
            <div className="w-col w-col-3 w-col-medium-3">
              {this.props.eventJson.name}
            </div>
            <div className="w-col w-col-3 w-col-medium-3">
              <a
                href={"/pages/leaders/#" + this.props.eventJson.host}
                className="host"
              >
                {this.props.eventJson.host}
              </a>
            </div>
            <AttendeesCell event={event} maxLength={10} />
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
