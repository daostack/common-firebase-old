import { CirclePaymentStatus } from '../util/types';

export interface ISubscriptionEntity {
  id: string;

  cardId: string;
  userId: string;
  proposalId: string;

  payments: ISubscriptionPayment[];

  dueDate: Date;

  status: SubscriptionStatus;

  amount: number;

  metadata: ISubscriptionMetadata;

  paymentFailures?: ISubscriptionPayment[];

  revoked: boolean;
}

export interface ISubscriptionPayment {
  paymentId: string;
  paymentStatus: CirclePaymentStatus;
}

export interface ISubscriptionPaymentFailure {
 paymentId: string;

 paymentFailedOn: Date;
}

export interface ISubscriptionMetadata {
  common: {
    name: string;
    id: string;
  }
}


export type SubscriptionStatus = 'Active' | 'CanceledByUser' | 'CanceledByPaymentFailure' | 'PaymentFailed';