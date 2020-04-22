import React from "react";
import ReactDOM from "react-dom";
import Airtable from "airtable";

import AirtableAPI from "./airtable_api.js";

var base = new Airtable({ apiKey: process.env.AIRBASE_API_KEY }).base(
  "app53ecZ2UL9M6JOw"
);

function getUserByEmail(email, onSuccess) {
  if(!email) {
    return;
  }

  base('Users').select({
    maxRecords: 1,
    filterByFormula: '{email}=\"'+email+'\"'
  }).eachPage(function page(records, fetchNextPage) {
    if (records.length == 0) {
       onSuccess(null);
    }
    onSuccess(records[0]);
  });
}

function getAirbaseUserById(id) {
  if(!id) {
    return;
  }

  base('Users').select({
    maxRecords: 1,
    filterByFormula: '{email}=\"'+email+'\"'
  }).eachPage(function page(records, fetchNextPage) {
    if (records.length == 0) {
      return null;
    }
    return records[0];
  });
}

class EnrollForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      submitted: false,
      name: '',
      email: '',
      wechatUserName: '',
    };
  }

  handleSubmit = event => {
    this.setState({submitted: true});
    event.preventDefault();
    // TODO refactor use promise or async await
  
    // get user
    getUserByEmail(this.state.email, user => {
      console.log(user);
      if (user) {
        // udate user wechat
        const userId = user.id;
        const fields = user.fields;
        fields.WechatUserName = this.state.wechatUserName;
        AirtableAPI.updateUser(userId, fields, (rec) => {
          console.log("user wechat update success", rec);
        });

        // TODO now hard code the trailEvent id:
        const TRAIL_EVENT_ID = 'recXx8gFGJ6c9fC2R';
        
        AirtableAPI.getEvent(TRAIL_EVENT_ID, (event) => {
          AirtableAPI.join(event, userId, 
            (rec) => {
            console.log("joined with event", rec);
          }, (err) => {
            console.log(err);
          });
        })
      }
    });
  }

  handleChange = (event)=> {
    const name = event.target.name;
    
    if (name == 'name') {
      this.setState({name: event.target.value});
    } else if (name == 'email') {
      this.setState({email: event.target.value}); 
    } else if (name == 'wechat') {
      this.setState({wechatUserName: event.target.value});  
    }
    
    event.preventDefault();
  }

  render() {
    const submitted = this.state.submitted;

    let btn = (
      <div className="top-margin">
            <div className="algin-center"><input type="submit" 
            onClick={this.handleSubmit} 
            value="预留席位" data-wait="Please wait..." className="button w-button"/></div>
          </div>
    );
    let notification;

    if (submitted) {
      btn = null;
      notification = (
      <div data-w-id="event-form" className="form-block w-form">
        <div className="success-message w-form-done" style={{display: 'block'}}>
          <div>感谢报名！具体参与方式会通过邮件发送给你</div>
        </div>
      </div> 
      );
    }

    return (
      <div className="submit-project-wrapper">
        <form id="email-form" name="email-form" data-name="Email Form" className="form" data-netlify="true" >
          <div>
            <label htmlFor="Timeline" className="field-label-2">下一次新人课程将会在2020年6月14日北京时间下午2点—4点在线上进行<br />请提前报名，我们会通过邮件和微信告知参与方式
            </label>
          </div>
          <div>
            <label htmlFor="name" className="field-label">你的名字或昵称</label>
            <input type="text" value={this.state.name} onChange={this.handleChange} className="text-field-form w-input" max-length="256" name="name" placeholder="请输入姓名"  required="" readOnly={this.props.submitted}/></div>
          <div>
            <label htmlFor="email" className="field-label">邮箱地址</label>
            <input type="email" value={this.state.email} onChange={this.handleChange} className="text-field-form w-input" max-length="256" name="email" placeholder="mail@company.com" required="" readOnly={this.props.submitted}/></div>
          <div>
            <label htmlFor="wechat" className="field-label">微信号</label>
            <input type="text" value={this.state.wechatUserName} onChange={this.handleChange} className="text-field-form w-input" max-length="256" name="wechat" placeholder="请输入微信号" required="" readOnly={this.props.submitted}/></div>
          { btn }
        </form>
        {notification}
        </div>
    );
  }
}

ReactDOM.render(<EnrollForm />, document.getElementById("enroll-form"));
