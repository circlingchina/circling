import React from "react";
import ReactDOM from "react-dom";
import PaymentButton from "./components/PayButton";

const paymentSingleEvent = document.getElementById("payment-single-event");
if (paymentSingleEvent) {
  ReactDOM.render(
    <PaymentButton chargeType="SINGLE_EVENT" />,
    paymentSingleEvent
  );
}

const paymentMonthly = document.getElementById("payment-monthly");
if (paymentMonthly) {
  ReactDOM.render(<PaymentButton chargeType="MONTHLY" />, paymentMonthly);
}

const paymentHalfYear = document.getElementById("payment-half-year");
if (paymentHalfYear) {
  ReactDOM.render(<PaymentButton chargeType='HALF_YEAR'/>, paymentHalfYear);
}

const paymentVip = document.getElementById("payment-vip");
if (paymentMonthly) {
  ReactDOM.render(<PaymentButton chargeType="VIP" />, paymentVip);
}
