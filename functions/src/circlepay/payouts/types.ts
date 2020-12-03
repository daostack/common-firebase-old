import { IBaseEntity } from '../../util/types';

export interface IPayoutEntity extends IBaseEntity {
  /**
   * This is the id of the payout on circle side. Cam
   * be useful for updating payout status
   */
  circlePayoutId: string;
}