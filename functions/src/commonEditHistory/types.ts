import { IBaseEntity } from '../util/types';
import { ICommonUpdate, ICommonEntity } from '../common/types';

export interface ICommonEditHistory extends IBaseEntity {
	commonId: string,
	changedBy: string,
	originalDocument: ICommonEntity,
	newDocument: ICommonEntity,
}