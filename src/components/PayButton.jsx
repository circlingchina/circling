import React, { useState } from "react";
import pingpp from 'pingpp-js';
import api from "../circling-api";

import {getNewCharge} from '../circling-api/index';

export default function PayButton(props) {
    
  const [user, setUser] = useState({}); 
    
  window.netlifyIdentity.on('login', async (netiflyUser) => {
    const result = await api.findUserByEmail(netiflyUser.email);
    if(result.user) {
      setUser(result.user);
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
  return (
    <>
      <a onClick={async() => { await initiatePayment(); }} href="#" className="button membership w-button">点此购买</a>
    </>
  );
}
