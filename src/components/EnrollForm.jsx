import React from "react";
import isEmail from 'validator/lib/isEmail';
import isMobilePhone from 'validator/lib/isMobilePhone';
import isEmpty from 'validator/lib/isEmpty';
import AirtableAPI from "../airtable/api";
import isWechatHandle from '../utils/isWechatHandle';

export default class EnrollForm extends React.Component {

  constructor(props) {
    super(props);
  
    this.state = {
      submitted: false,
      name: '',
      email: '',
      wechatUserName: '',
      error: ''
    };
  }
  
  validate = () => {
    if (isEmpty(this.state.name)) {
      this.setState({error: '姓名或昵称未填写'});
      return false;
    }

    if (!isEmail(this.state.email)) {
      this.setState({error: 'Email 格式不正确'});
      return false;
    }
    // Assuming that wechat handle accepts mobile with formats of multiple countries
    if (!isMobilePhone(this.state.wechatUserName, 'any') && 
        !isWechatHandle(this.state.wechatUserName)) {
      this.setState({error: '微信用户名格式不正确'});
      return false;
    }
    
    this.setState({error: ''});
    return true;
  }
  
  doSubmit = async () => {
    this.setState({ submitted:  true });
    
    try {
      const user = await AirtableAPI.getUserByEmail(this.state.email);

      const trailEvent = await AirtableAPI.getEvent(process.env.TRAIL_EVENT_ID);
      
      if (user) {
        // Udate user wechat, but do not overwrite the name and email at the moment.
        const userId = user.id;
        const fields = user.fields;
        fields.WechatUserName = this.state.wechatUserName;

        const updatedUser = await AirtableAPI.updateUser(userId, fields);
        // console.log("user wechat update success", updatedUser);
      }

      if (user && trailEvent) {
        const updatedTrailEvent = await AirtableAPI.join(trailEvent, user.id);
        // console.log("joined with event", updatedTrailEvent);
      }
    } catch (err) {
      console.error(err);
    }
  }

  handleSubmit = async event => {
    event.preventDefault();

    const ralidateResult = this.validate();
    if (ralidateResult) {
      await this.doSubmit();
    }
  }

  handleChange = (event)=> {
    const name = event.target.name;
    
    if (name === 'name') {
      this.setState({name: event.target.value});
    } else if (name === 'email') {
      this.setState({email: event.target.value}); 
    } else if (name === 'wechat') {
      this.setState({wechatUserName: event.target.value});  
    }
    
    event.preventDefault();
  }

  render() {
    const submitted = this.state.submitted;
    const hasError = !isEmpty(this.state.error);

    let btn = (
      <div className="top-margin">
        <div className="algin-center"><input type="submit" 
          onClick={this.handleSubmit} 
          value="预留席位" data-wait="Please wait..." className="button w-button"/></div>
      </div>
    );
    let notification;

    if (hasError) {
      notification = (
        <div data-w-id="event-form" className="form-block w-form">
          <div className="error-message w-form-done" style={{display: 'block'}}>
            <div>{this.state.error}</div>
          </div>
        </div> 
      );
    } else {
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
            <input type="text" value={this.state.name} onChange={this.handleChange} className="text-field-form w-input" max-length="256" name="name" placeholder="请输入姓名"  required="" readOnly={this.props.submitted}/>
          </div>
          <div>
            <label htmlFor="email" className="field-label">邮箱地址</label>
            <input type="email" value={this.state.email} onChange={this.handleChange} className="text-field-form w-input" max-length="256" name="email" placeholder="mail@company.com" required="" readOnly={this.props.submitted}/>
          </div>
          <div>
            <label htmlFor="wechat" className="field-label">微信号</label>
            <input type="text" value={this.state.wechatUserName} onChange={this.handleChange} className="text-field-form w-input" max-length="256" name="wechat" placeholder="请输入微信号" required="" readOnly={this.props.submitted}/>
          </div>
          { notification }
          { btn }
        </form>
        
      </div>
    );
  }
}