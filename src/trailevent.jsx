import ReactDOM from "react-dom";
import React from "react";
import EnrollForm from './components/EnrollForm';
import TrailEventBlock from './components/TrailEventBlock';

const elEnrollForm = document.getElementById("enroll-form");
if (elEnrollForm) {
  ReactDOM.render(<EnrollForm />, elEnrollForm);
}

const elTrailEventBlock = document.getElementById("trail-block");
if (elTrailEventBlock) {
  ReactDOM.render(<TrailEventBlock />, elTrailEventBlock);
}
