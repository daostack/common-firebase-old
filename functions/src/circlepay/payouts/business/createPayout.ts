import * as yup from 'yup';
import crypto from 'crypto';

import emailClient from './../../../notification/email';

import { IPayoutEntity } from '../types';
import { CommonError, NotImplementedError } from '../../../util/errors';
import { validate } from '../../../util/validate';
import { bankAccountDb } from '../../backAccounts/database';
import { payoutDb } from '../database';
import { proposalDb } from '../../../proposals/database';
import { env } from '../../../constants';

const createPayoutValidationSchema = yup.object({
  proposalId: yup
    .string()
    .uuid()
    .required(),

  bankAccountId: yup
    .string()
    .uuid()
    .required()
});

type CreatePayoutPayload = yup.InferType<typeof createPayoutValidationSchema>;

export const createPayout = async (payload: CreatePayoutPayload): Promise<IPayoutEntity> => {
  // Validate the payload
  await validate(payload, createPayoutValidationSchema);

  // Get needed data (and check if the proposal and bank account exists)
  const proposal = await proposalDb.getFundingRequest(payload.proposalId);
  const bankAccount = await bankAccountDb.get(payload.bankAccountId);

  // Check if there is no (or all are expired) payouts for that proposal
  const payouts = await payoutDb.getMany({ proposalId: payload.proposalId });

  if (payouts.length) {
    for (const payout of payouts) {
      // @todo
    }
  }

  // Create the payout
  const payout = await payoutDb.add({
    circlePayoutId: null,
    proposalId: payload.proposalId,

    amount: proposal.fundingRequest.amount,

    destination: {
      circleId: bankAccount.circleId,
      id: bankAccount.id
    },

    security: env.payouts.approvers.map((approver, index) => ({
      id: index,
      token: crypto.randomBytes(32).toString('hex'),
      redeemed: false,
      redemptionAttempts: 0
    })),

    status: 'pending',
    executed: false,
    voided: false
  });

  // Send the emails
  env.payouts.approvers.map((async (approver, index) => {
    const urlBase = process.env.NODE_ENV === 'dev'
      ? 'http://localhost:5003/common-staging-50741/us-central1'
      : env.endpoints.base;

    await emailClient.sendTemplatedEmail({
      templateKey: 'approvePayout',
      to: approver,
      subjectStubs: null,
      emailStubs: {
        payoutId: payout.id,
        amount: (payout.amount / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        url: `${urlBase}/circlepay/payouts/approve?payoutId=${payout.id}&index=${index}&token=${payout.security[index].token}`
      }
    });
  }));

  // Create the event
  // @todo

  // Return the created proposal
  return payout;
};