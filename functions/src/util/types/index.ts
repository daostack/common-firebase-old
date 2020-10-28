import { EVENT_TYPES } from '../../event/event';

export type valueOf<T> = T[keyof T];
export type Nullable<T> = T | null | undefined;

export type CirclePaymentStatus = 'pending' | 'confirmed' | 'paid' | 'failed';

/**
 * In the entities bellow there is `[key: string]: any;` that
 * allows us to use anything on that entity if not typed. Maybe it
 * is a good idea to add it, because it will force us to write the type
 * definitions for everything we use?
 */

export interface IProposalEntity {
  id: string;

  proposerId: string;

  dao: string;

  description: {
    funding: number;
  }

  [key: string]: any;
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

  [key: string]: any;
}

export interface ICardEntity {
  id: string;

  creationData: Date;

  userId: string;
  cardId: string;

  payments: string[];
  proposals: string[];

  [key: string]: any;
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

  safeAddress: string;
  ethereumAddress: string;

  [key: string]: any;
}

export * from '../../subscriptions/types';
export * from './payments';