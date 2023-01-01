import config from 'config';
import StatsD from 'hot-shots';

const pjson = require('../../../package.json');

const service = `${pjson.name}-${process.env.NODE_ENV || 'development'}`;

const dogstatsd = new StatsD({
  port: config.get('logs.dogstatsd.port'),
  globalTags: { service, app: service },
  /* errorHandler: (error) => { }, */
});

/**
 *  Sending metrics to lcoal statsd
 */
export default (method = '', options = {}, callback) => {
  const {
    name,
    value,
    sampleRate,
    tags,
  } = options;

  const validMethods = ['increment', 'decrement', 'histogram', 'gauge', 'unique', 'distribution'];
  const valid = validMethods.includes(method);

  if (valid) dogstatsd[method](name, value, sampleRate, tags);
  if (typeof callback === 'function') callback(valid);
};
