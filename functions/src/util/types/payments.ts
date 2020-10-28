import { CirclePaymentStatus } from './index';

export interface IPaymentEntity {
  id: string;

  type: PaymentType;
  status: CirclePaymentStatus;

  proposalId?: string;
  subscriptionId?: string;

  [key: string]: any;
}

export type PaymentType = 'OneTimePayment' | 'SubscriptionPayment';
