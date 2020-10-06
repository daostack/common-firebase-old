require('module-alias/register');

import { env } from '@env';
import * as tests from './tests';
import * as cron from './cron';
import * as relayer from './relayer';
import * as graphql from './graphql';
import graphqlTriggers from './graphql/util/triggers';
import * as  mangopay from './mangopay';
import mangopayTriggers from './mangopay/triggers';
import * as notification from './notification';
import * as event from './event';
import * as create from './creation';
import * as circlepay from './circlepay';
import * as circlepayTriggers from './circlepay/triggers';

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
exports.circlepay = circlepay.circlepay;
exports.circlepayTriggers = circlepayTriggers;

exports.cronJobs = cron.crons;
