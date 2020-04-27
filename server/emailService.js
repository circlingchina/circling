

let aws = require('aws-sdk');
const pug = require ('pug');
// Provide the full path to your config.json file. 
aws.config.loadFromPath('./config.json');

// Specify a configuration set. If you do not want to use a configuration
// set, comment the following variable, and the 
// ConfigurationSetName : configuration_set argument below.
// const configuration_set = "ConfigSet";

// The character encoding for the email.
const charset = "UTF-8";

// Create a new SES object. 
let ses = new aws.SES();

const sendWelcomeMail = (userName, toEmail) => {
  
  const sender = "Jess <jess@circlingchina.org>"; // This address must be verified with Amazon SES.
  const subject = "Jess 给新用户的一封信";

  //compile body from template
  const compiledFunction = pug.compileFile('./emails/welcome.pug');
  // Render a set of data
  const body_html = compiledFunction({
    name: userName
  });

  sendMail(sender, toEmail, subject, body_html);
};

//Try to send the email.
const sendMail = (sender, recipient, subject, body_html) => {
  // Specify the parameters to pass to the API.
  const params = { 
    Source: sender, 
    Destination: { 
      ToAddresses: [
        recipient 
      ],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: charset
      },
      Body: {
        Html: {
          Data: body_html,
          Charset: charset
        }
      }
    },
  // ConfigurationSetName: configuration_set
  };

  ses.sendEmail(params, (err, data) => {
    // If something goes wrong, print an error message.
    if(err) {
      console.log("Error", err.message);
    } else {
      console.log("Email sent! Message ID: ", data.MessageId);
    }
  });
};

sendWelcomeMail("Rachel", "wongr11@gmail.com");
