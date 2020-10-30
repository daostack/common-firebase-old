import { EVENT_TYPES } from '../../event/event';
import { IPaymentAmount, IPaymentRefund, IPaymentSource } from './payments';

export type valueOf<T> = T[keyof T];
export type Nullable<T> = T | null | undefined;

export type CirclePaymentStatus = 'pending' | 'confirmed' | 'paid' | 'failed';

export interface IProposalEntity {
  id: string;

  proposerId: string;

  dao: string;

  description: {
    funding: number;
  }
}

export interface ICommonMember {
  address: string;
  userId: string;
}

export interface ICommonMetadata {
  contribution: 'monthly' | 'one-time';
}

export interface ICommonEntity {
  id: string;
  name: string;

  members: ICommonMember[];

  metadata: ICommonMetadata;
}

export interface ICardEntity {
  id: string;

  creationData: Date;

  userId: string;
  cardId: string;

  payments: string[];
  proposals: string[];
}

export interface IEventEntity {
  id: string;

  userId: string;
  objectId: string;

  createdAt: Date;
  type: EVENT_TYPES;
}

export interface IUserEntity {
  id: string;

  email: string;

  /**
   * The address of the on-chain wallet
   */
  safeAddress: string;

  /**
   * This is the address of the local wallet (which is the
   * owner of the on-chain wallet, which is stored as safeAddress)
   */
  ethereumAddress: string;
}

export interface ICircleNotification {
  clientId: string;
  notificationType: 'payments' | string;

  payment: {
    id: string;
    merchantId: string;
    merchantWalletId: string;

    status: CirclePaymentStatus;

    amount: IPaymentAmount;
    source: IPaymentSource;

    createDate: Date;
    updateDate: Date;

    refunds: IPaymentRefund[];
  }
}

export * from '../../subscriptions/types';
export * from './payments';