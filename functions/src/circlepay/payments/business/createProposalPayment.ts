import * as yup from 'yup';

import { IProposalPayment } from '../types';
import { CommonError } from '../../../util/errors';
import { validate } from '../../../util/validate';
import { proposalDb } from '../../../proposals/database';

import { createPayment } from './createPayment';
import { pollPayment } from './pollPayment';

const createProposalPaymentValidationSchema = yup.object({
  userId: yup.string()
    .required(),

  cardId: yup.string()
    .uuid()
    .required(),

  proposalId: yup.string()
    .uuid()
    .required(),

  ipAddress: yup.string()
    .required(),

  sessionId: yup.string()
    .required()
});

/**
 * Creates payment for join request and then updates the join request with payment information
 *
 * @param payload
 */
export const createProposalPayment = async (payload: yup.InferType<typeof createProposalPaymentValidationSchema>): Promise<IProposalPayment> => {
  // Validate the data
  await validate(payload, createProposalPaymentValidationSchema);

  // Find the proposal
  const proposal = await proposalDb.getJoinRequest(payload.proposalId);

  // Check if the proposal is made by the user
  if (proposal.proposerId !== payload.userId) {
    throw new CommonError('Cannot create proposal payment for proposal, that is not owned by the user', {
      proposalId: proposal.id,
      proposerId: proposal.proposerId,
      userId: payload.userId
    });
  }

  // Check if the proposal is with the correct contribution type
  if (proposal.join.fundingType !== 'one-time') {
    throw new CommonError(
      'Cannot create proposal payment for proposals that are not of funding type `one-time`. ' +
      'For charging subscription proposals you must use `createSubscriptionPayment`!', {
        proposalId: proposal.id
      });
  }

  // The cardID and if the user is the owner of that card will be validated in that function. Also the Id of the
  // proposal will be used as idempotency key, so we are insured that only one payment will be made for one proposal
  // (of one-time type)
  let payment = await createPayment({
    userId: payload.userId,
    cardId: payload.cardId,
    ipAddress: payload.ipAddress,
    sessionId: payload.sessionId,

    type: 'one-time',
    amount: proposal.join.funding,
    objectId: proposal.id
  });

  // Attach the payment to the proposal
  await proposalDb.update({
    ...proposal,
    join: {
      ...proposal.join,
      payments: [
        ...(proposal.join.payments || []),
        payment.id
      ]
    }
  });

  // Poll the payment
  payment = await pollPayment(payment);

  // Return the payment
  return payment as IProposalPayment;
};