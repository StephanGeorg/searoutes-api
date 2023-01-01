import HTTPStatus from 'http-status';

import delay from '../../../utils/helper/delay';

const keys = [];

export const getKeys = () => keys;

export const generateKeys = () => new Promise((resolve) => {
  keys.push(Date.now());
  resolve(keys);
});

export const readKeys = async () => {
  try {
    await delay(5000);
    await generateKeys();
    await readKeys();
  } catch (err) {
    console.log({ err });
  }
};

export const authenticate = (req, res, next) => {
  const auth = true;
  // const activeKeys = getKeys();
  if (!auth) {
    res.status(HTTPStatus.UNAUTHORIZED);
    res.json({
      statusCode: HTTPStatus.UNAUTHORIZED,
      error: HTTPStatus[HTTPStatus.UNAUTHORIZED],
      message: 'Failed authentication',
    });
    return;
  }
  next();
};
