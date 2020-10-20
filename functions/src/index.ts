import { env } from './env';
import { tests } from './tests';
import * as cron from './cron';
import * as relayer from './relayer';
import graphqlTriggers from './graphql/util/triggers';
import * as notification from './notification';
import * as event from './event';
import * as create from './creation';
import * as circlepayTriggers from './circlepay/triggers';
import * as emailTriggers from './email/triggers';
import { graphqlApp } from './graphql';
import { circlepayApp } from './circlepay';

// Add the __tests__ endpoints only if enabled
if(env.tests.enabled) {
  exports.tests = tests;
}

exports.relayer = relayer.relayer;
exports.graphql = graphqlApp;
exports.graphqlSubs = graphqlTriggers;
exports.create = create.create;
exports.notificationSub = notification;
exports.eventSub = event;
exports.circlepay = circlepayApp;
exports.circlepayTriggers = circlepayTriggers;
exports.emailTriggers = emailTriggers

exports.cronJobs = cron.crons;
