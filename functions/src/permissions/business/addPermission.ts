import { ICommonEntity } from '../../common/types';
import { userDb } from '../../users/database';
import { Role } from '../types';
import { IUserEntity } from '../../users/types';
import { CommonError } from '../../util/errors';

/**
 * Updating permission of a user to make changes in a common
 * - For creating common, the user (userId) will get a 'founder' permission
 * - For a user (requestByUserId) asking to set permission to another user (userId),
 * we check that requestByUserId has sufficient permission to grant permission (getting this requestByUserId from the http request)
 * and if that user has permission (right now, meaning being founder) then userId will get the permission
 * 
 * @return {Promise<IUserEntity>}                 [description]
 * @param  common - The common that we need to grand permission for
 * @param  userId - The id of the user who needs the permission
 * @param  role - The role we want to grand the user with userId
 * @param  requestByUserId - the userId of the user requestiong to grand permission to userId
 *                           * for common creation, it will be null, the userId will get the founder role
 *                           * for other operations, it will be id of the user who sent the http request
 */
export const addPermission = async (common: ICommonEntity, userId: string, role: Role, requestByUserId = null) : Promise<IUserEntity> => {
  if (!requestByUserId) 
  {
    // for when a common is being created
    return await setPermission(common, role, userId);
  } else {
    // not tested yet because we don't have the functionality of setting permission from the frontend
    const requestByUser = await userDb.get(requestByUserId);
    const roles = requestByUser.roles;
    let canGrantPermission = false;
    // right now, if requestByUser is a founder, he can grant permission to another user
    roles.forEach((roleObj) => {
      if (roleObj.role === 'founder' && roleObj.data.commonId === common.id) {
        canGrantPermission = true;
      }
    });
    if (canGrantPermission) {
      return await setPermission(common, role, userId);
    }
  }
  return null;
}

const setPermission = async (common: ICommonEntity, role: Role, userId: string) => {
  try {
    const userDoc = await userDb.get(userId);
    const userRoles = userDoc?.roles || [];
    userRoles.push({role, data: {commonId: common.id}})
    userDoc.roles = userRoles;
    await userDb.update(userId, userDoc);
    return userDoc;
  } catch (error) {
    logger.error(error)
    throw new CommonError(`Could not set permission ${role} to user ${userId}`)
  }

}