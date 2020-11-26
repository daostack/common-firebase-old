import { v4 } from 'uuid';
import admin from 'firebase-admin';

import Timestamp = admin.firestore.Timestamp;

import { ICardEntity } from '../types';
import { BaseEntityType, SharedOmit } from '../../../util/types';
import { CardCollection } from './index';

type OmitedProperties = 'payments';

/**
 * Prepares the passed card for saving and saves it. Please note that
 * there is *no* validation being done here
 *
 * @param card - the card to be saved
 */
export const addCard = async (card: SharedOmit<ICardEntity, BaseEntityType | OmitedProperties>): Promise<ICardEntity> => {
  const cardDoc: ICardEntity = {
    id: v4(),

    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),

    payments: card.[],

    ...card
  };

  if(process.env.NODE_ENV === 'test') {
    cardDoc['testCreated'] = true;
  }

  await CardCollection
    .doc(cardDoc.id)
    .set(cardDoc);

  return cardDoc;
};