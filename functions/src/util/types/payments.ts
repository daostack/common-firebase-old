export interface IPaymentEntity {
  id: string;

  status: IPaymentStatus;
}

export type IPaymentStatus = 'pending' | 'confirmed' | string;