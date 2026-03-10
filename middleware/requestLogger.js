const loggerConfig = require('../config/loggerConfig');
const { writeLog } = require('../utils/fileWriter');

/**
 * Express middleware that logs every incoming request to a file.
 * Sits at the front of the middleware chain so it sees everything.
 */
function requestLogger(req, res, next) {
  // If logging is turned off in config, skip everything and let the request through.
  // This gives us a kill switch without having to comment out the middleware.
  if (!loggerConfig.enabled) {
    return next();
  }

  // We grab the time right when the request arrives so we can measure
  // how long the entire request-response cycle takes.
  const startTime = Date.now();

  // We listen for the 'finish' event on the response instead of trying to
  // read the status code right here. The status code does not exist yet at
  // this point -- it only gets set once a route handler actually sends a
  // response. The 'finish' event fires after the response has been fully
  // written, so by then all the data we need is available.
  res.on('finish', () => {
    const responseTime = (Date.now() - startTime) + 'ms';

    const logEntry = {};

    if (loggerConfig.includeTimestamp) {
      logEntry.timestamp = new Date().toISOString();
    }

    if (loggerConfig.includeMethod) {
      logEntry.method = req.method;
    }

    if (loggerConfig.includeUrl) {
      logEntry.url = req.originalUrl;
    }

    if (loggerConfig.includeStatusCode) {
      logEntry.statusCode = res.statusCode;
    }

    if (loggerConfig.includeResponseTime) {
      logEntry.responseTime = responseTime;
    }

    const entryString = JSON.stringify(logEntry);
    writeLog(loggerConfig.logFilePath, entryString);
  });

  // Always call next() no matter what. The logger is a passthrough --
  // it should never block or delay the request. It just observes.
  next();
}

module.exports = requestLogger;
