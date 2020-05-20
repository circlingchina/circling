import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Alert from 'react-bootstrap/Alert';

export default function OfflineEventsModal(props) {
  const eventName = props.eventJson.fields.Name;

  let contactName = '';
  if (Array.isArray(props.eventJson.fields.OfflineEventContact) && 
        props.eventJson.fields.OfflineEventContactExtra) {
    contactName = props.eventJson.fields.OfflineEventContactExtra.Name;
  }

  const offlineEventAddress = props.eventJson.fields.OfflineEventAddress;
  const offlientEventExtraInfo = props.eventJson.fields.OfflineEventExtra;

  const alert = props.showAlert ? 
    (<Alert variant='danger'>微信号或手机号格式不正确</Alert>) : null;

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
          线下地址：{offlineEventAddress} <br /><br />
          {offlientEventExtraInfo} <br />
        </p>
        <br/>
        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text>我的微信号（手机号）是</InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl
            aria-label="wechatUserName" 
            aria-describedby="wechatUserName" 
            value={props.wechatUserName}
            onChange={props.onWechatUserNameChange}
          />
        </InputGroup>

        { alert }
          
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={props.onJoinOfflineEvent}>参加</Button>
      </Modal.Footer>
    </Modal>
  );
}
