import { db } from '../../../util';
import { Collections } from '../../../constants';
import { NotImplementedError } from '../../../util/errors';

import { IPaymentEntity } from '../types';
import { addPayment } from './addPayment';

export const PaymentsCollection = db.collection(Collections.Payments)
  .withConverter<IPaymentEntity>({
    fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot): IPaymentEntity {
      return snapshot.data() as IPaymentEntity;
    },

    toFirestore(object: IPaymentEntity | Partial<IPaymentEntity>, options?: FirebaseFirestore.SetOptions): FirebaseFirestore.DocumentData {
      return object;
    }
  });

export const paymentDb = {
  get: () => {
    throw new NotImplementedError('Payment Get is not implemented');
  },
  getMany: () => {
    throw new NotImplementedError('Payment GetMany is not implemented');
  },
  add: addPayment
};