import Pool from 'pg-pool';
import config from 'config';

import log from '../logs/logs';

const conf = config.get('db.postgres');
const pool = new Pool(conf);

pool.on('error', (error) => {
  log(error.message, error, 'error');
});

pool.on('connect', (client) => {
  log('Postgres DB connected', client, 'info');
});

export default (text = '', values = []) => pool.query(text, values);
