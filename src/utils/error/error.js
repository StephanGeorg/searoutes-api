/**
 *  Extending an existing error with custom properties
 */
export const extendError = (error, properties = {}) => {
  const finalError = Object.assign(error, properties);
  return finalError;
};

/**
 * @extends Error
 */
class ExtendableError extends Error {
  constructor(message, { statusCode, isPublic, logType }) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.statusCode = statusCode;
    this.logType = logType || 'error';
    this.isPublic = isPublic;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor.name);
  }
}

export default ExtendableError;
