require('module-alias/register');

import * as admin from 'firebase-admin';
import { databaseURL } from './settings';
import {env} from '@env';

if(env.environment === 'dev') {
  admin.initializeApp();
} else {
  admin.initializeApp({
    credential: admin.credential.cert(require('@env/adminsdk-keys.json')),
    databaseURL: databaseURL
  });
}

import * as relayer from './relayer';
import * as graphql from './graphql';
import * as graphqlTriggers from './graphql/util/triggers';
import * as  mangopay from './mangopay';
import * as mangopayTriggers from './mangopay/triggers';
import * as notification from './notification';

// Add the __tests__ endpoints only if enabled
if(env.tests.enabled) {
  exports.tests = require('./tests').tests;
}

exports.relayer = relayer.relayer;
exports.graphql = graphql.graphql;
exports.mangopay = mangopay.mangopay;
exports.notification = notification;
exports.mangopaySubs = mangopayTriggers;
exports.graphqlSubs = graphqlTriggers;


exports.cronJobs = require('./cron').crons;