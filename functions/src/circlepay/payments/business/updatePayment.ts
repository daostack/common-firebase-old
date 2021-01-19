import { IPaymentEntity } from '../types';
import { ICirclePayment } from '../../types';
import { failureHelper, feesHelper, isSuccessful } from '../helpers';
import { paymentDb } from '../database';
import { CommonError } from '../../../util/errors';
import { commonDb } from '../../../common/database';
import { proposalDb } from '../../../proposals/database';
import { addCommonMemberByProposalId } from '../../../common/business/addCommonMember';
import { subscriptionDb } from '../../../subscriptions/database';
import { handleFinalizedSubscriptionPayment } from './handlers/subscriptions/handleFinalizedSubscriptionPayment';

/**
 * Handles update from circle and saves it to the database
 *
 * @param oldPayment - the current version of the payment from our FireStore
 * @param circlePayment - the current version of the payment as is from Circle
 */
export const updatePayment = async (oldPayment: IPaymentEntity, circlePayment: ICirclePayment): Promise<IPaymentEntity> => {
  let updatedPayment: IPaymentEntity = oldPayment;

  switch (circlePayment.data.status) {
    case 'failed':
      updatedPayment = {
        ...oldPayment,

        status: circlePayment.data.status,
        failure: failureHelper.processFailedPayment(circlePayment)
      };

      break;
    case 'confirmed':
    case 'paid':
      updatedPayment = {
        ...oldPayment,

        status: circlePayment.data.status,
        fees: feesHelper.processCircleFee(circlePayment)
      };

      break;
    default:
      logger.warn('Unknown payment state occurred. Not knowing how to handle the payment update', {
        payment: oldPayment,
        circlePayment: circlePayment.data,
        unknownStatus: circlePayment.data.status
      });

      break;
  }

  updatedPayment = await paymentDb.update(updatedPayment);

  // If the status has change broadcast an event
  if (oldPayment.status !== updatedPayment.status) {
    logger.debug('Payment status update occurred on payment', {
      status: `${oldPayment.status} -> ${updatedPayment.status}`,
      paymentType: oldPayment.type,
      paymentId: oldPayment.id
    }, {
      oldPayment: oldPayment,
      updatedPayment: updatedPayment
    });

    // Create the payment updated event
    switch (updatedPayment.status) {
      case 'failed':
      case 'confirmed':
      case 'paid':
      case 'pending':
        // @todo Implement the payment status changed events
        // logger.error('NotImplementedError: Payment status changes events');

        break;
      default:
        throw new CommonError(`The payment status has updated, but is not known.`, {
          payment: updatedPayment
        });
    }

    // @todo If this is subscription payment handle subscription update
    if (oldPayment.type === 'subscription') {
      const subscription = await subscriptionDb.get(updatedPayment.subscriptionId);

      logger.info('Handling payment status change for subscription payment');

      // Handle this only if the previous status was explicitly pending
      // and the new one is successful
      if (oldPayment.status === 'pending') {
        await handleFinalizedSubscriptionPayment(subscription, updatedPayment);
      }
    }

    // @todo If this is proposal payment handle the proposal update
    if (oldPayment.type === 'one-time') {
      logger.warn('Not Implemented Waring: Payment status change for subscription payment');

      // Handle this only if the previous status was explicitly pending
      // and the new one is successful
      if (oldPayment.status === 'pending' && isSuccessful(updatedPayment)) {
        logger.notice('Updating data for hanging payment', {
          paymentId: oldPayment.id
        });

        const proposal = await proposalDb.getJoinRequest(oldPayment.proposalId);

        // Update common funding info
        const common = await commonDb.get(proposal.commonId);

        common.raised += proposal.join.funding;
        common.balance += proposal.join.funding;

        await commonDb.update(common);

        // Add the user as member
        await addCommonMemberByProposalId(proposal.id);
      }
    }
  }

  return updatedPayment;
};