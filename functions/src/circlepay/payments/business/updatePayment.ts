import { IPaymentEntity } from '../types';
import { ICirclePayment } from '../../types';
import { failureHelper, feesHelper, isSuccessful } from '../helpers';
import { paymentDb } from '../database';
import { CommonError } from '../../../util/errors';
import { commonDb } from '../../../common/database';
import { proposalDb } from '../../../proposals/database';
import { addCommonMemberByProposalId } from '../../../common/business/addCommonMember';

/**
 * Handles update from circle and saves it to the database
 *
 * @param payment - the current version of the payment from our FireStore
 * @param circlePayment - the current version of the payment as is from Circle
 */
export const updatePayment = async (payment: IPaymentEntity, circlePayment: ICirclePayment): Promise<IPaymentEntity> => {
  let updatedPayment: IPaymentEntity = payment;

  switch (circlePayment.data.status) {
    case 'failed':
      updatedPayment = {
        ...payment,

        status: circlePayment.data.status,
        failure: failureHelper.processFailedPayment(circlePayment)
      };

      break;
    case 'confirmed':
    case 'paid':
      updatedPayment = {
        ...payment,

        status: circlePayment.data.status,
        fees: feesHelper.processCircleFee(circlePayment)
      };

      break;
    default:
      logger.warn('Unknown payment state occurred. Not knowing how to handle the payment update', {
        payment,
        circlePayment: circlePayment.data,
        unknownStatus: circlePayment.data.status
      });

      break;
  }

  updatedPayment = await paymentDb.update(updatedPayment);

  // If the status has change broadcast an event
  if (payment.status !== updatedPayment.status) {
    logger.debug('Payment status update occurred on payment', {
      status: `${payment.status} -> ${updatedPayment.status}`,
      paymentType: payment.type,
      paymentId: payment.id
    }, {
      oldPayment: payment,
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
    if (payment.type === 'subscription') {
      logger.warn('Not Implemented Waring: Payment status change for subscription payment');

      // Handle this only if the previous status was explicitly pending
      // and the new one is successful
      // if (payment.status === 'pending' && isSuccessful(payment)) {
      //
      // }
    }

    // @todo If this is proposal payment handle the proposal update
    if (payment.type === 'one-time') {
      logger.warn('Not Implemented Waring: Payment status change for subscription payment');

      // Handle this only if the previous status was explicitly pending
      // and the new one is successful
      if (payment.status === 'pending' && isSuccessful(payment)) {
        logger.notice('Updating data for hanging payment', {
          paymentId: payment.id
        });

        const proposal = await proposalDb.getJoinRequest(payment.proposalId);

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