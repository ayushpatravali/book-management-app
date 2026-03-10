const app = require('./app');
const loggerConfig = require('./config/loggerConfig');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Server is running on port ' + PORT);
  console.log('Request logs will be written to: ' + loggerConfig.logFilePath);
});
