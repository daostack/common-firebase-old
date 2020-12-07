// import * as yup from 'yup';
// import crypto from 'crypto';
//
// import emailClient from './../../../notification/email';
//
// import { IPayoutEntity } from '../types';
// import { validate } from '../../../util/validate';
// import { bankAccountDb } from '../../backAccounts/database';
// import { payoutDb } from '../database';
// import { proposalDb } from '../../../proposals/database';
// import { env } from '../../../constants';
//
// const createPayoutValidationSchema = yup.object({
//   amount: yup
//     .number()
//     .required(),
//
//   bankAccountId: yup
//     .string()
//     .uuid()
//     .required()
// });
//
// type CreatePayoutPayload = yup.InferType<typeof createPayoutValidationSchema>;
//
// export const createPayoutForProposal = async (payload: CreatePayoutPayload): Promise<IPayoutEntity> => {
//   // Validate the payload
//   await validate(payload, createPayoutValidationSchema);
//
//   // Get needed data (and check if the proposal and bank account exists)
//   const bankAccount = await bankAccountDb.get(payload.bankAccountId);
//
//   // Create the payout
//   const payout = await payoutDb.add({
//     circlePayoutId: null,
//     proposalId: payload.proposalId,
//
//     amount: proposal.fundingRequest.amount,
//
//     destination: {
//       circleId: bankAccount.circleId,
//       id: bankAccount.id
//     },
//
//     security: env.payouts.approvers.map((approver, index) => ({
//       id: index,
//       token: crypto.randomBytes(32).toString('hex'),
//       redeemed: false,
//       redemptionAttempts: 0
//     })),
//
//     status: 'pending',
//     executed: false,
//     voided: false
//   });
//
//   // Send the emails
//
//
//   // Create the event
//   // @todo
//
//   // Return the created proposal
//   return payout;
// };