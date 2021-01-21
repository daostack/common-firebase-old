export interface IPermission {
	role: Role;
	data?: {
		commonId?: string
	}
}

export type Role = 'founder'| 'moderator' | 'other';