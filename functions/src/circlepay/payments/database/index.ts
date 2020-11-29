import { db } from '../../../util';
import { Collections } from '../../../constants';
import { NotImplementedError } from '../../../util/errors';

import { IPaymentEntity } from '../types';
import { addPayment } from './addPayment';
import { updatePayment } from './updatePayment';
import { getPayments } from './getPayments';
import { getPayment } from './getPayment';

export const PaymentsCollection = db.collection(Collections.Payments)
  .withConverter<IPaymentEntity>({
    fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot): IPaymentEntity {
      return snapshot.data() as IPaymentEntity;
    },

    toFirestore(object: IPaymentEntity | Partial<IPaymentEntity>, options?: FirebaseFirestore.SetOptions): FirebaseFirestore.DocumentData {
      return object;
    }
  });

// @todo Docs
export const paymentDb = {
  get: getPayment,
  getMany: getPayments,
  add: addPayment,
  update: updatePayment
};