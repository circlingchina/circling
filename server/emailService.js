// load nodemailer as follows
// npm install nodemailer --save
const nodemailer = require('nodemailer');
// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    "host": process.env.EMAIL_HOST,
    "port": process.env.EMAIL_PORT,
    //"secureConnection": true, // use SSL, the port is 465
    "auth": {
        "user": process.env.EMAIL_USER, // user name
        "pass": process.env.EMAIL_PASS  // password
    }
});

const email_from = `${process.env.EMAIL_NICKNAME} <${process.env.EMAIL_USER}>`
const subject_prefix = process.env.NODE_ENV == 'production' ? '' : `[${process.env.NODE_ENV}]`

const sendVerificationEmail = (toEmail, precreateUserId, comfirmLink) => {
    const link = comfirmLink ? comfirmLink : `https://www.circlingquanquan.com/#confirmation_token=${precreateUserId}`;
    const mailOptions = {
        from: email_from, // sender address mailfrom must be same with the user
        to: toEmail, // list of receivers
        bcc: email_from,
        subject: subject_prefix + '欢迎加入CirclingChina', // Subject line
        // text: 'Hello world', // plaintext body
        html:`<p>您好，感谢你对CirclingChina的关注!</p>
        <p>您的账号已经创建成功，请在三天内点击以下链接完成验证邮箱:</p>
        <p><a href="${link}">${link}</a></p>
        <br/>
        <p>Circling China团队</p>`, // html body
    };
    return send(mailOptions);
}

const sendPasswordResetEmail = (toEmail, passwordResetId) => {
    const link = `https://www.circlingquanquan.com/#recovery_token=${passwordResetId}`;
    const mailOptions = {
        from: email_from, // sender address mailfrom must be same with the user
        to: toEmail, // list of receivers
        bcc: email_from,
        subject: subject_prefix + 'Circling China 密码重置', // Subject line
        // text: 'Hello world', // plaintext body
        html:`<p>您正在通过邮箱重置 Circling China 的密码</p>
        <p>请在5分钟内点击下面链接完成密码重置:</p>
        <p><a href="${link}">${link}</a></p>
        <br/>
        <p>Circling China团队</p>`, // html body
    };
    return send(mailOptions);
};

const sentFirstPaidEmail = (userName, toEmail, eventName, eventStartTime) => {
    const mailOptions = {
        from: email_from, // sender address mailfrom must be same with the user
        to: toEmail, // list of receivers
        bcc: email_from,
        subject: subject_prefix + '从这里开启你的Circling之旅吧', // Subject line
        // text: 'Hello world', // plaintext body
        html:`<p>亲爱的 ${userName}</p>
        <p>您好！</p>
        <p>恭喜您已经成为CirclingChina会员。</p>
        <p>您可以报名您的第一个Circling活动开始你的圈圈之旅啦。</p>
        <br/>
        <p>你可以通过<strong>CirclingChina官网</strong>的活动页面报名：<a href="https://www.circlingquanquan.com/pages/memberpage">https://www.circlingquanquan.com/pages/memberpage</a></p>
        <p>也可以通过手机报名，微信搜索小程序：<strong>圈圈Circling</strong>。</p>
        <p></p>
        <p></p>
        <br/>
        <p><strong>圈圈旅程指南：</strong></p>
        <p>👉如果您Circling的初体验者（circling经验5次以下），建议参加：</p>
        <p><strong>新人圈、有机圈、生日圈。</strong></p>
        <br/>
        <p>👉在具体了解了Circling后（circling经验5-10次），可以尝试体验：</p>
        <p><strong>话题圈、歌舞伎圈、Circling周边游戏等。</strong></p>
        <br/>
        <p>👉已经对Circling熟悉的你（circling经验10次以上），欢迎去玩更进阶的圈圈：</p>
        <p><strong>捣蛋鬼圈、精分圈、通道圈。</strong></p>
        <br/>
        <p>👉如果你已经参与Circling20次以上，可以尝试：</p>
        <p><strong>更深度的Circling系列封闭圈，或者1对1Circling（单独付费）</strong></p>
        <br/>
        <p>也可以尝试自己发起有容器的社群活动与大家一起玩耍哦。</p>
        <br/>
        <p>快报名开始你的第一次圈圈吧~</p>
        <p>期待在圈里与您相见！</p>
        <br/>
        <p>Circling China团队</p>`, // html body
    };
    return send(mailOptions);
};

const sentFirstEventEmail = (userName, toEmail, eventName, eventStartTime) => {
    const mailOptions = {
        from: email_from, // sender address mailfrom must be same with the user
        to: toEmail, // list of receivers
        bcc: email_from,
        subject: subject_prefix + '请查收你的第一次Circling参与指南', // Subject line
        // text: 'Hello world', // plaintext body
        html:`<p>亲爱的 ${userName}：</p>
        <p>您好！</p>
        <p>恭喜您已经成功报名 Circling 活动:</p>
        <p>活动名称：<strong>${eventName}</strong>，开始时间： <strong>${eventStartTime}（北京时间）</strong>。</p>
        <p>为了您顺利参加Circling活动及提高体验，现将需要做的准备工作及注意事项发送给您。</p>
        <br/>
        <p><strong>一、参加Circling前的准备工作</strong></p>
        <p>1. 下载【瞩目】客户端：<a href="https://zhumu.com/download">https://zhumu.com/download</a> 。为了同时接收其他参与者的画面，我们推荐在【电脑】或者【平板】上参与Circling，<strong>不要用手机连线</strong>。根据提示完成瞩目的安装及注册。</p>
        <p>2. 在Circling China网站个人活动页面中，已报名活动栏右侧会显示“进入房间”，可以提前点击进行软件测试。</p>
        <p>3. 请在活动开始【10分钟前】，通过Circling China网站个人活动页面，点击“进入房间”按钮，进入瞩目会议室。</p>
        <p>4. 请珍惜您的报名名额，确保准时出现在您所报的活动中。如果因为临时原因不能参与，请最晚在活动开始【2小时前】在Circling China网站个人页面中取消报名，方便其他人可以参与。</p>
        <br/>
        <p><strong>二、Circling参与须知</strong></p>
        <p>1. 请找一个安静、能确保隐私的环境。如果有室友或家人，请告诉他们在活动期间不要来打扰。请不要在走路或在咖啡馆等公共场所进行连线。</p>
        <p>2. 请在连线期间保持环境的安静，若需要与房间内其他人讲话，请暂时关闭话筒和摄像头。</p>
        <p>3. 请在连线前，确保网络畅通，手机开到飞行模式，关闭电脑或平板上会弹出通知的软件。</p>
        <p>4. 画面是Circling必不可少的媒介，因此活动不支持仅语音参加，请开启摄像头。</p>
        <br/>
        <p><strong>三、首次参加 Circling的tips</strong></p>
        <p>1. 在circling中“说什么，不说什么”。在Circling中，我们侧重讲的是以下内容:</p>
        <ul>
          <li>想象自己是一台摄像机，客观描述当下你所看见的——”我看见/我发现……”（如，你的嘴角有些抽搐，你的眉头紧锁）</li>
          <li>描述你的内心情感——“我感受到……”（如，关心、担忧、焦虑、愤怒）</li>
          <li>分享你的身体感受——“我感受到……”（如，肩膀很紧张、心跳很快、脸有点热）</li>
        </ul>
        <p>2. 慎讲故事，除非它非常鲜活，是当下思绪的很大一部分，这时候就简短回顾它，然后回到讲它时的感受上来。</p>
        <p>3. 慎给建议。除非对方明确要求。尤其当人表现出负面情绪时，观察自己想“帮忙”，想“解决问题”的冲动，但不要立刻回应，只需要陪对方一起经历这个当下。</p>
        <p>4. 勿带“问题”看人看己。不要习惯性地套用你学过的知识投射，尤其是如果你常常阅读心理学的分析，就更要放一边，看到当下的喜怒哀乐思绪情感如其所是。</p>
        <p>5. 享受沉默。这是一个允许沉默的空间，试着练习练习看。不必没话找话，让话来找我们才是，其余时间就与沉默(尴尬)舒服地相处吧。</p>
        <p>6. 以上建议并非对言论的审查或限制， 只是一份邀请 ，请你用一种新的方式与人沟通。如果你不习惯，或不知道怎么发言，也可以先看看其他人是如何表达的。</p>
        <br/>
        <p>您可能还会感兴趣的内容：</p>
        <p><a href="https://www.circlingquanquan.com/pages/whatiscircling1">什么是Circling</a></p>
        <p><a href="https://www.circlingquanquan.com/pages/whatiscircling3">Circling的价值</a></p>
        <br/>
        <p>期待与您相见！</p>
        <p>Circling China团队</p>`, // html body
    };
    return send(mailOptions);
};


const send = (mailOptions) => {
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });
}


exports.send = send;
exports.sendVerificationEmail = sendVerificationEmail;
exports.sendPasswordResetEmail = sendPasswordResetEmail;
exports.sentFirstPaidEmail = sentFirstPaidEmail;
exports.sentFirstEventEmail = sentFirstEventEmail;
