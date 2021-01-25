import React from 'react';

import classNames from 'classnames';
import Popover from 'react-bootstrap/Popover';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

function AttendeesCell({event, maxLength}) {
  let attendees = event.attendees();

  let needEllipses = false;
  if (attendees.length > maxLength) {
    attendees = attendees.slice(0, maxLength);
    needEllipses = true;
  }

  const userList = attendees.map((u)=> {
    return (<span key={u.id}>{u.name}<br /></span>);
  });

  if (needEllipses) {
    userList.push('...');
  }

  const popover = (
    <Popover id={'popover-joiners-' + event.id()}>
      <Popover.Content>
        {userList}
      </Popover.Content>
    </Popover>
  );

  const spanEl = (
    <span className={classNames({underline: !event.isEmpty()})}>
      {event.numAttendees()}/{event.maxAttendees()}
    </span>
  );

  let spanWrapper;
  if (event.isEmpty()) {
    spanWrapper = spanEl;
  } else {
    spanWrapper = (
      <OverlayTrigger
        trigger={['hover', 'focus']}
        placement="right"
        overlay={popover}
      >
        {spanEl}
      </OverlayTrigger>
    );
  }

  return(
    <div className="w-col w-col-1 w-col-medium-1">
      {spanWrapper}
    </div>
  );
}

export default AttendeesCell;