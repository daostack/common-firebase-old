import { env } from './env';
import { tests } from './tests';
import * as cron from './cron';
import graphqlTriggers from './graphql/util/triggers';
import * as notification from './notification';
import * as event from './event';
import * as circlepayTriggers from './circlepay/triggers';
import * as emailTriggers from './email/triggers';
import * as subscriptionsTriggers from './subscriptions/triggers';

import { createApp } from './creation';
import { graphqlApp } from './graphql';
import { relayerApp } from './relayer';
import { circlepayApp } from './circlepay';
import { subscriptionsApp } from './subscriptions';

// Add the __tests__ endpoints only if enabled
if(env.tests.enabled) {
  exports.tests = tests;
}

// --- Express apps
exports.create = createApp;
exports.relayer = relayerApp;
exports.graphql = graphqlApp;
exports.circlepay = circlepayApp;
exports.subscriptions = subscriptionsApp;


// --- Triggers and Subscriptions
exports.eventSub = event;
exports.graphqlSubs = graphqlTriggers;
exports.emailTriggers = emailTriggers
exports.notificationSub = notification;
exports.circlepayTriggers = circlepayTriggers;
exports.subscriptionTriggers = subscriptionsTriggers;

exports.cronJobs = cron.crons;
