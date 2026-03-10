// Central config for the request logger middleware.
// Change any field here and the logger picks it up on next server restart.

const loggerConfig = {
  // Changing this moves where log entries get written -- use an absolute path in production
  logFilePath: './logs/requests.log',

  // Switch to 'text' if you want plain readable lines instead of JSON objects
  format: 'json',

  // Set to false to completely disable logging without removing the middleware
  enabled: true,

  // If false, the HTTP method (GET, POST, etc.) won't appear in log entries
  includeMethod: true,

  // If false, the request URL path won't be recorded
  includeUrl: true,

  // If false, log entries won't have a timestamp -- not recommended, but your call
  includeTimestamp: true,

  // If false, the response status code (200, 404, etc.) gets left out of the log
  includeStatusCode: true,

  // If false, response time calculation gets skipped entirely
  includeResponseTime: true,
};

// future improvement: add log rotation to archive logs after they hit a
// certain size -- keeping this config simple for now but that would be the
// next thing to add for production

module.exports = loggerConfig;
