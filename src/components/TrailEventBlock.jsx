import React, { useState, useEffect } from 'react';
import api from "../circling-api/index";
import Event from '../models/Event';

export default function TrailEventBlock(props) {
  const [event, setEvent] = useState(null);
    
  useEffect(() => {
    (async () => {
      const events = await api.getTrailEvent();
      if (Array.isArray(events) && events.length > 0) {
        setEvent(new Event(events[0]));
      }
    })();
  }, []);
    
  let startTimeDisplay = "";
  if (event) {
    startTimeDisplay = event.startTimeDisplay();
  }
    
  return (
    <div className="algin-center">
      <div data-w-id="1200627d-24c1-de19-7336-40fa2187d030" className="sub-text">即将开始<br /></div>
      <h1 data-w-id="1200627d-24c1-de19-7336-40fa2187d033" className="h1 big"><span>新人免费课程</span><br />‍<br />{startTimeDisplay}<br /></h1>
    </div>
  );
}
