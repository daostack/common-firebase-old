require('module-alias/register');

import * as admin from 'firebase-admin';
import { databaseURL } from './settings';
import { env } from '@env';
import * as tests from './tests';
import * as cron from './cron';

// if(env.environment === 'dev') {
//   admin.initializeApp();
// } else {
//   admin.initializeApp({
//     credential: admin.credential.cert(require('@env/adminsdk-keys.json')),
//     databaseURL: databaseURL
//   });
// }

import * as relayer from './relayer';
import * as graphql from './graphql';
import * as graphqlTriggers from './graphql/util/triggers';
import * as  mangopay from './mangopay';
import * as mangopayTriggers from './mangopay/triggers';
import * as notification from './notification';
import * as event from './event';
import * as create from './creation';

// Add the __tests__ endpoints only if enabled
if(env.tests.enabled) {
  exports.tests = tests.tests;
}

exports.relayer = relayer.relayer;
exports.graphql = graphql.graphql;
exports.mangopay = mangopay.mangopay;
exports.mangopaySubs = mangopayTriggers;
exports.graphqlSubs = graphqlTriggers;
exports.create = create.create;
exports.notificationSub = notification;
exports.eventSub = event;

exports.cronJobs = cron.crons;
