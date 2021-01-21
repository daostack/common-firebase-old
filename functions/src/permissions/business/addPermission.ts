import { ICommonEntity } from '../../common/types';
import { userDb } from '../../users/database';

export const addPermission = async (common: ICommonEntity, userId: string, role = 'founder') => {
	if (common.metadata.founderId === userId) {
     
    // set founder
  } else {
    // set role to user
    // check that assigne
  }
}