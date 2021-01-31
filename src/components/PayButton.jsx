import React, { useState } from "react";
import pingpp from 'pingpp-js';
import api from "../circling-api";

import {getNewCharge} from '../circling-api/index';

export default function PayButton(props) {

  const [user, setUser] = useState({});
  const [newUser, setNewUser] = useState(false);

  window.netlifyIdentity.on('login', async (netiflyUser) => {
    // const result = await api.findUserByEmail(netiflyUser.email);

    const userLocal = window.localStorage.getItem('circlingchina.user');

    if(userLocal) {
      const user = JSON.parse(userLocal);
      setUser(user);

      // dirty implementation for checking the new user
      setNewUser(user.premium_level === '0' && user.premium_expired_at === '1970-01-01T00:00:00.000Z');

    } else {
      throw Error(`${netiflyUser.email} not found in user db!`);
    }
  });

  window.netlifyIdentity.on('logout', () => {
    setUser({});
  });

  async function initiatePayment() {
    const charge = (await getNewCharge(user.id, props.chargeType)).charge;

    pingpp.createPayment(charge, (result, err) => {
      console.log("result:" + result);
      console.log("err:" + err);
      if (result == "success") {
        console.log("success");
        // 只有微信JSAPI (wx_pub)、微信小程序（wx_lite）、QQ 公众号 (qpay_pub)、支付宝小程序（alipay_lite）支付成功的结果会在这里返回，
        // 其他的支付结果都会跳转到 extra 中对应的 URL
      } else if (result == "fail") {
        console.log('payment failed', err);
        // Ping++ 对象 object 不正确或者微信JSAPI/微信小程序/QQ公众号支付失败时会在此处返回
      } else if (result == "cancel") {
        console.log('customer cancelled');
        // 微信JSAPI、微信小程序、QQ 公众号、支付宝小程序支付取消支付
      }
    });
  }

  if (props.chargeType !== 'HALF_YEAR') {
    return (
      <>
        <a onClick={async() => { await initiatePayment(); }} href="#" className="button membership w-button">点此购买</a>
      </>
    );
  } else if (newUser){
    return (
      <>
        <div className="top-margin flex center">
          <a
            href="https://t.zsxq.com/EUznuFi"
            target="_blank" rel="noopener noreferrer"
            className="button membership w-button"
          >点此购买</a>
        </div>
        <div className="payment-subtitle">
            点击购买会跳转知识星球付费链接，加入后即可成为季度会员
        </div>
      </>
    );
  }
  return (
    <>
      <div className="top-margin flex center">
        <a onClick={async() => { await initiatePayment(); }} href="#" className="button membership w-button">点此购买</a>
      </div>
      <div className="payment-subtitle">
            {/* 2021 年 1 月 31 日前， 已到期会员续费专用 */}
      </div>
    </>
  );
}
