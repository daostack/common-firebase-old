import { ISubscriptionEntity } from '../types';

export const handleFailedPayment = async (subscription: ISubscriptionEntity): Promise<void> => {
  if(subscription.status === 'Active') {
    subscription.status = 'PaymentFailed';

  }
};