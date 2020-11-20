import * as cron from './cron';
import * as event from './event';
import * as notification from './notification';
import * as messageTriggers from './discussionMessage/triggers';

import { circlepayApp } from './circlepay';
import { commonsApp } from './common';
import { proposalCrons, proposalTriggers, proposalsApp } from './proposals';
import { backofficeApp } from './backoffice';


// --- Express apps
export const commons = commonsApp;
export const circlepay = circlepayApp;
export const proposals = proposalsApp;
export const backoffice = backofficeApp;

// --- Triggers and Subscriptions
exports.eventSub = event;
exports.notificationSub = notification;
exports.proposalCrons = proposalCrons;
exports.messageTriggers = messageTriggers;
exports.proposalTriggers = proposalTriggers;

exports.cronJobs = cron;
