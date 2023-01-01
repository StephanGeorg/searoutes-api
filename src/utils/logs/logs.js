import winston from 'winston';
import safeStringify from 'fast-safe-stringify';
import PrettyError from 'pretty-error';
import { consoleFormat } from 'winston-console-format';

const pjson = require('../../../package.json');

const devel = process.env.NODE_ENV === 'development';

/**
 *  Create the logger instance
 */
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.ms(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  defaultMeta: {
    service: `${pjson.name}-${process.env.NODE_ENV || 'development'}`,
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
  exitOnError: false,
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' }),
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});

/**
 *  Create local console logger
 */
const localLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.ms(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  defaultMeta: {
    service: `${pjson.name}-${process.env.NODE_ENV || 'development'}`,
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [],
  exitOnError: false,
  exceptionHandlers: [
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});


// Add logger stream for morgan
logger.stream = {
  write(message) {
    logger.info(message);
  },
};

// Add console logger for development
if (devel) {
  localLogger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.padLevels(),
      consoleFormat({
        showMeta: true,
        metaStrip: ['timestamp', 'service'],
        inspectOptions: {
          depth: Infinity,
          colors: true,
          maxArrayLength: Infinity,
          breakLength: 120,
          compact: Infinity,
        },
      }),
    ),
  }));
}


const tryJSONStringify = (obj) => {
  try {
    return JSON.stringify(obj);
  } catch (err) {
    return null;
  }
};

export default (message = '', context = {}, level = 'info') => {
  if ((level === undefined || level === 'error') && context instanceof Error) {
    const pe = new PrettyError();
    if (devel) localLogger.error(`${context.message} ${pe.render(context)}`);
    return logger.error(`${context.message} ${context.stack}`);
  }
  const safeJson = tryJSONStringify(context) || safeStringify(context);

  if (devel) localLogger.log(level, { message, ...JSON.parse(safeJson) });
  return logger.log(level, { message, ...JSON.parse(safeJson) });
};
