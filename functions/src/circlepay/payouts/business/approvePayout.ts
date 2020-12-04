import * as yup from 'yup';
import { validate } from '../../../util/validate';
import { payoutDb } from '../database';
import { CommonError } from '../../../util/errors';
import { updatePayout } from '../database/updatePayout';

const approvePayoutSchema = yup.object({
  payoutId: yup
    .string()
    .uuid()
    .required(),

  index: yup
    .number()
    .required(),

  token: yup
    .string()
    .required()
});

type ApprovePayoutPayload = yup.InferType<typeof approvePayoutSchema>;

export const approvePayout = async (payload: ApprovePayoutPayload): Promise<boolean> => {
  // Validate the payload
  await validate(payload, approvePayoutSchema);

  // Get the payout
  const payout = await payoutDb.get(payload.payoutId);

  // Check if the payout is voided
  if (payout.voided) {
    throw new CommonError('Cannot approve voided payout!', {
      payoutId: payload.payoutId
    });
  }

  // Find the token
  const token = payout.security.find(x => x.id === Number(payload.index));

  if (!token) {
    throw new CommonError(`There is no token with ID ${payload.index}`);
  }

  if (token.redeemed) {
    return true;
  }

  // Check the token
  if (token.token === payload.token) {
    // If the token is valid - redeem it
    token.redeemed = true;

    // @todo event
  } else {
    // If the token is invalid - change the redemption attempts number
    token.redemptionAttempts += 1;

    // @todo event

    // If the redemption attempts are more than or equal to 3 void the payout
    if (token.redemptionAttempts >= 3) {
      payout.voided = true;

      // @todo event
    }
  }

  // Update the token in the payout
  const tokenIndex = payout.security.findIndex(x => x.id === token.id);

  payout[tokenIndex] = token;

  // Save the changes
  await updatePayout(payout);

  // Return the current status of the payout
  return token.redeemed;
};