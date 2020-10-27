export interface IPaymentEntity {
  id: string;

  type: PaymentType;
  status: PaymentStatus;
}

export type PaymentStatus = 'pending' | 'confirmed' | string;
export type PaymentType = 'OneTimePayment' | 'SubscriptionPayment';