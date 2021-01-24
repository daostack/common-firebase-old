import { ICommonEntity } from '../common/types';


export interface IPermissionPayload {
	common: ICommonEntity// should be the new common updateable type
	role: Role,
	userId: string, 
	requestByUserId?: string
}

export interface IPermission {
	role: Role;
	data?: {
		commonId?: string
	}
}

export type Role = 'founder'| 'moderator' | 'other';