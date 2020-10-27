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
}

export interface ISubscriptionPayment {
  paymentId: string;
  paymentStatus: SubscriptionPaymentStatus;
}

export interface ISubscriptionMetadata {
  common: {
    name: string;
    id: string;
  }
}


export type SubscriptionPaymentStatus = 'Pending' | 'Successful' | 'Declined';
export type SubscriptionStatus = 'Active' | 'CanceledByUser' | 'CanceledByPaymentFailure' | 'PaymentFailed';