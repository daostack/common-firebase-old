import { ISubscriptionEntity } from '../../util/types';
import admin from 'firebase-admin';
import { Collections } from '../../util/constants';
import { circlePayService } from '../../circlepay/service';
import { CommonError } from '../../util/errors';

const db = admin.firestore();

/**
 * Charges one subscription (only if the due date is
 * today or in the past) by the subscription id
 *
 * @param subscriptionId - the id of the subscription, that we want to charge
 */
export const chargeSubscriptionById = async (subscriptionId: string): Promise<void> => {
  const subscription = (await db.collection(Collections.Subscriptions)
    .doc(subscriptionId)
    .get()).data() as ISubscriptionEntity;

  await chargeSubscription(subscription);
}

/**
 * Charges one subscription (only if the due date is
 * today or in the past) by the subscription entity
 *
 * @param subscription - the subscription entity
 */
export const chargeSubscription = async (subscription: ISubscriptionEntity): Promise<void> => {
  // @todo Remember to do something if the charge failed, cause the subscription will not be charged again from here!!!
  try {
    // Check if the due date is in the past
    if(subscription.dueDate > new Date()) {
      throw new CommonError(
        `Trying to charge subscription ${subscription.id}, but the due date is in the future!`,
        `Cannot charge your subscription`, {
          subscription
        }
      );
    }

    const {payment} = await circlePayService.createPayment({
      type: 'SubscriptionPayment'
    });

    subscription.paymentIds.push(payment.id);
    subscription.status = 'PaymentPending';

    await db.collection(Collections.Subscriptions)
      .doc(subscription.id)
      .update(subscription);
  } catch (e) {
    // @todo Do something other than crying?
  }
};