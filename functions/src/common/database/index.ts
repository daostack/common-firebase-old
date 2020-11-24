import { db } from '../../util';
import { Collections } from '../../constants';

import { addCommon } from './addCommon';
import { getCommon } from './getCommon';
import { updateCommon } from './updateCommon';
import { ICommonEntity } from '../types';

export const commonCollection = db.collection(Collections.Commons)
  .withConverter<ICommonEntity>({
    fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot): ICommonEntity {
      return snapshot.data() as ICommonEntity;
    },
    toFirestore(object: ICommonEntity | Partial<ICommonEntity>): FirebaseFirestore.DocumentData {
      return object;
    }
  });

export const commonDb = {
  addCommon,
  getCommon,
  updateCommon
};
