require("dotenv").config();
const fs = require('fs');
const readline = require('readline');

const {sendCampain202009} = require('./emailService');

const sendCampain = async (toEmails) => {
  for (const toEmail of toEmails) {
    const result = await sendCampain202009(toEmail);
    console.info("email sent with result", result);
  }
};

let emails = [];

async function processLineByLine() {
  const fileStream = fs.createReadStream('emails.txt');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  for await (const line of rl) {
    // Each line in input.txt will be successively available here as `line`.
    emails.push(line);
  }

  sendCampain(emails);

}

processLineByLine();

// sendCampain(['ydatylmonv@gmail.com']);
