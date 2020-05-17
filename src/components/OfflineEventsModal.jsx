import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

export default class OfflineEventsModel extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  handelClickJoin = async (e) => {
    e.preventDefault();

    console.log('handelClickJoin');

    // validate

    // update user

    // join


    // return this.props.handelJoinOfflineEvent(event, user);
  }

  render() {
  
    return (
      <Modal
        {...this.props}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >

        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            {this.props.event.toJSON().fields.Name}
          </Modal.Title>
        </Modal.Header>
     
        <Modal.Body>
          线下地址： {this.props.event.toJSON().fields.OfflineEventAddress}
          <br />

          线下活动信息： {this.props.event.toJSON().fields.OfflineEventExtra}
          <br />
        </Modal.Body>
       
        <Modal.Footer>
          <Button variant="danger" onClick={this.props.handelJoinOfflineEvent}>参加</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
