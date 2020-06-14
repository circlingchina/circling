import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Alert from 'react-bootstrap/Alert';
import isObject from 'lodash/isObject';

export default function OfflineEventsModal(props) {
  const eventName = props.eventJson.name;

  let contactName = '';
  let contactWechatUserName = '';
  if (isObject(props.eventJson.fields.offline_event_contact)) {
    contactName = props.eventJson.fields.offline_event_contact.name;
    contactWechatUserName = props.eventJson.fields.offline_event_contact.wechat_id;
  }

  const offlineEventExtraInfo = props.eventJson.fields.offline_event_extra;

  const alert = props.showAlert ?
    (<Alert variant='danger'>微信号或手机号格式不正确</Alert>) : null;

  let userInfoSection;
  if (props.joined) {
    userInfoSection = (
      <p>
        我的报名的联络方式：<br />
      微信号: {props.wechatUserName}
        <br />
      手机号: {props.mobileNumber}
      </p>
    );
  } else {
    userInfoSection = (
      <>
        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text>我的微信号是</InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl
            aria-label="wechatUserName"
            aria-describedby="wechatUserName"
            value={props.wechatUserName}
            onChange={props.onWechatUserNameChange}
          />
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text>我的手机号是</InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl
            aria-label="mobileNumber"
            aria-describedby="mobileNumber"
            value={props.mobileNumber}
            onChange={props.onMobileNumberChange}
          />
        </InputGroup>

        { alert }
      </>
    );
  }

  return (
    <Modal
      show={props.show}
      onHide={props.onHide}
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {eventName}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>
          在报名参加线下活动之前，<br />
          请确认你的微信号或手机号，这样{contactName}就可以联系到你啦。 <br /><br />
          {contactName}的微信号：{contactWechatUserName} <br /><br />
          {offlineEventExtraInfo} <br />
        </p>
        <br/>
        {userInfoSection}
      </Modal.Body>
      {!props.joined &&
        <Modal.Footer>
          <Button variant="danger" onClick={props.onJoinOfflineEvent}>参加</Button>
        </Modal.Footer>
      }
    </Modal>
  );
}
