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

// export interface ISubscriptionPaymentMethod {
//
// }
//
// export type SubscriptionsPaymentMethodStatus = 'Active' | 'Inactive';

export type SubscriptionStatus = 'Active' | 'CanceledByUser' | 'CanceledByPaymentFailure' | 'PaymentFailed';
export type SubscriptionPaymentStatus = '';