import { IBaseEntity } from '../util/types';
import { IPermission } from '../permissions/types';

export interface IUserEntity extends IBaseEntity {
   uid: string;s

   email: string;
   photoURL: string;

   firstName: string;
   lastName: string;
   displayName: string;
   roles?: IPermission[];
}