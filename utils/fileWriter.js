// This is a separate file because file I/O is its own concern.
// If we ever swap from local files to a database or remote service for logs,
// we only change this one file and the middleware stays untouched.

const fs = require('fs');

/**
 * Appends a log entry to the given file path.
 * Designed to never throw or crash the server -- logging is not worth killing a request over.
 */
function writeLog(filePath, entry) {
  fs.appendFile(filePath, entry + '\n', (err) => {
    if (err) {
      // We deliberately swallow this error so the server keeps running.
      // A failed log write should never take down the whole application.
      console.error('[RequestLogger] Could not write to log file -- server continues normally');
      console.error(err.message);
    }
  });
}

module.exports = { writeLog };
