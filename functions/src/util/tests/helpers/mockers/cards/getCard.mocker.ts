import { NotFoundError } from '../../../../errors';
import { ICardEntity } from '../../../../../circlepay/cards/types';
import firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;


jest.mock('../../../../../circlepay/cards/database/getCard', () => ({
  getCard: jest.fn()
    .mockImplementation(async (cardId: string): Promise<ICardEntity> => {
      if (cardId === '404') {
        throw new NotFoundError('cardId', cardId);
      }

      return {
        id: cardId,
        circleCardId: cardId,
        metadata: undefined,
        ownerId: cardId,
        verification: {
          cvv: 'pass'
        },
        updatedAt: Timestamp.now(),
        createdAt: Timestamp.now()
      };
    })
}));