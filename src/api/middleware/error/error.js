import { isCelebrate } from 'celebrate';
import HTTPStatus from 'http-status';

import log from '../../../utils/logs/logs';

export default (err, req, res, next) => { // eslint-disable-line
  // Rendering and logging validation errors from celebrate
  // https://github.com/arb/celebrate/blob/b1ad0733fea5c46d5f5215637e9d45b9d7ff3f2d/lib/index.js#L129
  if (isCelebrate(err)) {
    const { joi, meta } = err;
    const errMsg = `Validation: ${joi.message}`;
    log(errMsg, { joi, meta }, 'warn');
    const result = {
      statusCode: HTTPStatus.BAD_REQUEST,
      error: HTTPStatus[HTTPStatus.BAD_REQUEST],
      message: errMsg,
      validation: {
        source: meta.source,
        keys: [],
      },
    };

    if (joi.details) {
      for (let i = 0; i < joi.details.length; i += 1) {
        const path = joi.details[i].path.join('.');
        result.validation.keys.push(path);
      }
    }
    return res.status(HTTPStatus.BAD_REQUEST).json(result);
  }

  const statusCode = err.status || err.statusCode || HTTPStatus.INTERNAL_SERVER_ERROR;
  const errorMessage = err.message || err.msg;
  const errorText = `${errorMessage} (${statusCode}): ${req.method} ${req.originalUrl} ${req.ip}`;
  const errorContext = err.context || {};
  const errorTask = err.task || 'Unknown task';
  const errorType = err.logType || 'error';

  // Set locals, only providing error in development
  res.locals.message = errorMessage;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  log(errorText, { task: errorTask, context: { ...errorContext } }, errorType);
  if (errorType === 'error') log(errorMessage, err, 'error'); // Add stack trace

  // Render the error
  res.status(statusCode);
  return res.json({ statusCode, error: HTTPStatus[statusCode], message: err.message });
};
