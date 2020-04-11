"use strict";

import React from "react";
import ReactDOM from "react-dom";
import EventsTable from "./components/EventsTable"

function getAirbaseUserId() {
  return window.airbaseUserId || window.localStorage.getItem("airbaseUserId");
}

function EventRegion() {
  return (
    <>
      <div className="section">
        <div className="container w-container">
          <UpcomingEvent />
        </div>
        <div className="page-divider">
          <div className="page-divider-white down" />
        </div>
      </div>
      <div className="section transparent">
        <div className="container w-container">
          <div className="sub-text red">
            本周会员Circling
            <br />
          </div>
          <EventsTable />
        </div>
        <div className="page-divider">
          <div className="page-divider-white down" />
        </div>
      </div>
    </>
  );
}

function UpcomingEvent(props) {
  return (
    <>
      <div className="sub-text red">即将开始</div>
      <div className="div-block-13">
        <div className="line-text">常规Circling 2020年4月2日 2:00pm</div>
        <a href="/zoom-link" className="button w-button" target="_blank">
          点击进入
        </a>
        <a href="/pages/whatiscircling2">查看我需要准备什么</a>
      </div>
    </>
  );
}

ReactDOM.render(<EventRegion />, document.getElementById("event-region"));
