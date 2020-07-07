const { createLogger, transports, format } = require('winston');
const { combine, timestamp, prettyPrint, json} = format;

const mainLogger = createLogger({
  level: 'debug',
  defaultMeta: { service: 'api.circlingchina' },
  format: combine(
    timestamp(),
    // json(),
    prettyPrint(),
  ),
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/info.log', level: 'info' }),
    new transports.File({ filename: 'logs/combined.log' }),
    new transports.Console()
  ],
});

module.exports = mainLogger;

  