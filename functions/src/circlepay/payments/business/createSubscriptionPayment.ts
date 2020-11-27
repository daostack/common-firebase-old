import { ISubscriptionPayment } from '../types';
import { NotImplementedError } from '../../../util/errors';

export const createSubscriptionPayment = async (): Promise<ISubscriptionPayment> => {
  throw new NotImplementedError();
}