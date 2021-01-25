import { ICommonEntity } from '../common/types';


export interface IPermissionPayload {
	/**
	 * The common that we grant permission to
	 */
	common: ICommonEntity;// should be the new common updateable type
	
	/**
	 * The role we want to grant the user with userId
	 */
	role: Role;

	/**
	 * The ID of the user that needs to get permission
	 */
	userId: string;

	/**
	 * The ID of the user who wants to grant permission to userId
	 */
	requestByUserId?: string;
}

export interface IPermission {
	/**
	 * The role of the user
	 */
	role: Role;

	/**
	 * The commonId of the common that a user has permission to
	 */
	data?: {
		commonId?: string
	}
}

export type Role = 'founder'| 'moderator' | 'other';