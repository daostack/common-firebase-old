import { IBaseEntity } from '../util/types';

export interface ICardEntity extends IBaseEntity {
  /**
   * This is the ID of the card for circle. When creating
   * charge request we should pass this ID to them
   */
  circleCardId: string;

  /**
   * This is the ID of the user, who created the card
   */
  ownerId: string;
}