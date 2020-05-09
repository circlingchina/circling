require("dotenv").config();
const {sentFirstEventEmail} = require('./emailService');

const sendEmail = async () => {
  let toEmail = null; // PUT YOUR EMAIL HERE!
  const result = await sentFirstEventEmail("Test User Name", toEmail);
  console.info("email sent with result", result);
};
sendEmail();