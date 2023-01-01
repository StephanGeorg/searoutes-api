import ee from 'event-emitter';
import { MongoClient } from 'mongodb';
import config from 'config';

import log from '../logs/logs';

const emitter = ee();

const mongoDatabase = config.get('db.mongo.database');
const mongoReplicaSet = config.get('db.mongo.replicaSet');
const mongoUrl = `${config.get('db.mongo.url')}/${mongoDatabase}?replicaSet=${mongoReplicaSet}`;

const connectOptions = config.get('db.mongo.connectOptions') || {};

let db;
MongoClient.connect(mongoUrl, connectOptions, (mongoErr, dbInstance) => {
  if (mongoErr) {
    log(mongoErr.message, mongoErr, 'error');
    throw new Error(mongoErr);
  }
  db = dbInstance.db(mongoDatabase);
  log('Mongo DB connected', dbInstance, 'info');
  emitter.emit('connected');
});

export default (reconnect) => {
  if (reconnect) {
    return new Promise((resolve) => {
      MongoClient.connect(mongoUrl, connectOptions, (mongoErr, dbInstance) => {
        if (mongoErr) {
          log(mongoErr.message, mongoErr, 'error');
          throw new Error(mongoErr);
        }
        db = dbInstance.db(mongoDatabase);
        log('Mongo DB connected', dbInstance, 'info');
        resolve(db);
      });
    });
  }
  return new Promise((resolve) => {
    if (!db) {
      emitter.on('connected', () => {
        resolve(db);
      });
    } else {
      // TODO: Check if the connection is lost. If so we will resolve
      // on the event of "reconnected"
      resolve(db);
    }
  });
};
