/*
 * starts a REPL console with `npm run console`
*/
require('dotenv').config();

const db = require("./db");
const repl = require("repl");
const Event = require("./models/Event");
const replServer = repl.start({});

// the following list of variables are avaliable in the REPL console
replServer.context.db = db;
replServer.context.Event = Event;

