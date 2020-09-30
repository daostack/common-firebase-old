import { EVENT_TYPES } from "./";
import { getDaoById } from '../db/daoDbService';
import { getProposalById } from '../db/proposalDbService';

interface IEventData {
    eventObject: (eventObjId: string) => any;
    notifyUserFilter: (eventObj: any) => string[] | Promise<string[]>;
}

export const eventData: Record<string, IEventData> = {
    [EVENT_TYPES.CREATION_COMMON]: {
        eventObject: async (commonId: string): Promise<any> => (await getDaoById(commonId)).data(),
        notifyUserFilter: (common: any): string[] => {
            return [common.members[0].userId];
        }
    },
    [EVENT_TYPES.CREATION_COMMON_FAILED]: {
        eventObject: async (commonId: string): Promise<any> => (await getDaoById(commonId)).data(),
        notifyUserFilter: (common: any): string[] => {
            return [common.members[0].userId];
        }
        
    },
    [EVENT_TYPES.CREATION_PROPOSAL]: {
        eventObject: async (proposalId: string): Promise<any> => (await getProposalById(proposalId)).data(),
        notifyUserFilter: async (proposal: any): Promise<string[]> => {
            const proposalDao = (await getDaoById(proposal.dao)).data();
            const userFilter = proposalDao.memberrs.map(member => {
                return member.userId;
            });
            return userFilter;
        }
    },
}