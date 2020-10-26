export type valueOf<T> = T[keyof T];

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
    members: ICommonMember[];

    metadata: ICommonMetadata;

    [key: string]: any;
}

export interface ICardEntity {
  id: string;

  creationData: Date;

  userId: string;

  payments: string[];
  proposals: string[];

  [key: string]: any;
};

export * from  './subscriptions';
export * from  './payments';