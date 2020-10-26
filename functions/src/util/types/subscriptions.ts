export interface ISubscriptionEntity {
  id: string;

  cardId: string;
  userId: string;
  proposalId: string;

  paymentIds: string[];

  dueDate: Date;

  status: SubscriptionStatus;

  amount: number;
}


export type SubscriptionStatus = 'Active' | 'CanceledByUser' | 'CanceledByPaymentFailure' | 'PaymentFailed' | 'PaymentPending';