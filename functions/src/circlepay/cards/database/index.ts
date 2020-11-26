import { db } from "../../../util";
import { Collections } from '../../../constants';
import { ICardEntity } from '../types';

import { addCard } from './addCard';
import { getCard } from './getCard';

export const CardCollection = db.collection(Collections.Commons)
  .withConverter<ICardEntity>({
    fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot): ICardEntity {
      return snapshot.data() as ICardEntity;
    },
    toFirestore(object: ICardEntity | Partial<ICardEntity>): FirebaseFirestore.DocumentData {
      return object;
    }
  });

export const cardDb = {
  /**
   * Method, used for adding new circle cards in the firestore.
   * Requires nice and formatted documents as it does not do any
   * validation on them. It will return the created card with the
   * generated values for createdAt, updatedAt and the ID of the document
   */
  add: addCard,
  get: getCard
}