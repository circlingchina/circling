require("dotenv").config();
const {sentFirstEventEmail, sentTrailEventEmail} = require('./emailService');

const sendEmail = async () => {
  let toEmail = null; // PUT YOUR EMAIL HERE!
  const result = await sentFirstEventEmail("Test User Name", toEmail);
  console.info("email sent with result", result);
};

const sendEmailTrailEvents = async (toEmails) => {
  for (const toEmail of toEmails) {
    const result = await sentTrailEventEmail(toEmail);
  console.info("email sent with result", result);
  }
  
};

sendEmailTrailEvents([
  'ydatylmonv@gmail.com',
  'alex.ziwen.liu@gmail.com',
'342643373@qq.com',
'2273397541@qq.com',
'linxian2020@outlook.com',
'itistangqing@163.com',
'svnpan@163.com',
'19RD10@queensu.ca',
'493271866@qq.com',
'xibanya07@yeah.net',
'yvette_hong@outlook.com',
'173398308@qq.com',
'406789553@qq.com',
'ohayo_33@hotmail.com',
'18993073268@163.com',
'mr.shzhou@gmail.com',
'ling.fang@uni-due.de',
'849371423@qq.com',
'zhangjiqiu1026@163.com',
'1305032794@qq.com',
'sumoxu@163.com',
'imzsj.sw@foxmail.com',
'jche0069@gmail.com',
'feixueqingtian@qq.com',
'suzy.m@163.com',
'lclingchen323@gmail.com',
'342408023@qq.com',
'1191139833@qq.com',
'284047671@qq.com',
'wyanhong2008.love@163.com',
'1614711370@qq.com',
'liuandida@yahoo.com',
'mercy09@163.com',
'wangy3@carleton.edu',
'Angelina5926@hotmail.com',
'1785724901@qq.com',
'785136957@qq.com',
'cgao1995@163.com',
'dingqinrui29@gmail.com',
'joke.cby@gmail.com',
'736597117@qq.com',
'623080303@qq.com',
'yuetangty@gmail.com',
'2660538531@qq.com',
'zhiyun_r@163.com',
'ziyi9786@126.com',
'773829786@qq.com',
'anna1842@163.com',
'519382067@qq.com',
'1185780057@qq.com'
]);
