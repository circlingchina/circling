import React from 'react';

import classNames from 'classnames';
import Popover from 'react-bootstrap/Popover';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

function AttendeesCell(props) {
  const spanEl = (
    <span className={classNames({underline: !props.event.isEmpty()})}>
      {props.event.getUsers().length}/{props.event.toJSON().max_attendees}
    </span>
  );

  let joinedUsers = props.event.users();

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

export default AttendeesCell;