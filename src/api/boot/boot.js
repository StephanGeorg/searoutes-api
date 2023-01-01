import log from '../../utils/logs/logs';
import { readKeys } from '../middleware/auth/auth';

const pjson = require('../../../package.json');

const { name } = pjson;
const env = `${process.env.NODE_ENV || 'development'}`;

export default (server, startTime) => {
  // Start listining for new keys
  readKeys();

  // Event listener for kill signals
  process.on('SIGINT', () => {
    server.close(async () => {
      log('Process terminated with SIGINT');
      process.exit();
    });
  });
  process.on('SIGTERM', () => {
    server.close(() => {
      log('Process terminated with SIGTERM');
      process.exit();
    });
  });

  const bootTime = new Date().getTime() - startTime.getTime();

  log(`🚀  ${name} (${env}) running on port ${server.address().port}`);
  log(`⏱️   in ${bootTime}ms`);
};
