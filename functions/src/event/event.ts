import { getDaoById } from '../db/daoDbService';
import { getProposalById } from '../db/proposalDbService';
import { getDiscussionMessageById } from '../db/discussionMessagesDb';
import { getDiscussionById } from '../db/discussionDbService';

interface IEventData {
    eventObject: (eventObjId: string) => any;
    notifyUserFilter: (eventObj: any) => string[] | Promise<string[]>;
}

export enum EVENT_TYPES {
    //CREATION notifications
    CREATION_COMMON = 'creationCommon',
    CREATION_COMMON_FAILED = 'creationCommonFailed',
    CREATION_PROPOSAL = 'creationProposal',
    CREATION_REQUEST_TO_JOIN = 'creationReqToJoin',
    MESSAGE_CREATED = 'messageCreated',
    //APPROVED notifications
    APPROVED_REQUEST_TO_JOIN = 'approvedReqToJoin',
    APPROVED_PROPOSAL = 'approvedProposal',
    //REJECTED notifications
    REJECTED_REQUEST_TO_JOIN = 'rejectedReqToJoin',
    REJECTED_PROPOSAL = 'rejectedProposal',
    //COMMON 
    COMMON_WHITELISTED = 'commonWhitelisted',
}

export const eventData: Record<string, IEventData> = {
    [EVENT_TYPES.CREATION_COMMON]: {
        eventObject: async (commonId: string): Promise<any> => (await getDaoById(commonId)).data(),
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        notifyUserFilter: (common: any): string[] => {
            return [common.members[0].userId];
        }
    },
    [EVENT_TYPES.CREATION_COMMON_FAILED]: {
        eventObject: async (commonId: string): Promise<any> => (await getDaoById(commonId)).data(),
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        notifyUserFilter: (common: any): string[] => {
            return [common.members[0].userId];
        }
    },
    [EVENT_TYPES.CREATION_PROPOSAL]: {
        eventObject: async (proposalId: string): Promise<any> => (await getProposalById(proposalId)).data(),
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        notifyUserFilter: async (proposal: any): Promise<string[]> => {
            const proposalDao = (await getDaoById(proposal.dao)).data();
            const userFilter = proposalDao.members.map(member => {
                return member.userId;
            });
            return userFilter;
        }
    },
    [EVENT_TYPES.CREATION_REQUEST_TO_JOIN]: {
        eventObject: async (proposalId: string): Promise<any> => (await getProposalById(proposalId)).data(),
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        notifyUserFilter: async (proposal: any): Promise<string[]> => {
            return [
              proposal.proposerId
            ];
        }
    },
    [EVENT_TYPES.MESSAGE_CREATED]: {
        eventObject: async (discussionMessageId: string): Promise<any> => (await getDiscussionMessageById(discussionMessageId)).data(),
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        notifyUserFilter: async (discussionMessage: any): Promise<string[]> => {
            const discussion = (await getDiscussionById(discussionMessage.discussionId)).data()
            const common =(await getDaoById(discussion.commonId)).data();
            return common.members.map(member => member.userId)
        }
    },
    [EVENT_TYPES.COMMON_WHITELISTED]: {
        eventObject: async (commonId: string): Promise<any> => (await getDaoById(commonId)).data(),
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        notifyUserFilter: async (dao: any): Promise<string[]> => {
            return [dao.members[0].userId];
        }
    },
    [EVENT_TYPES.APPROVED_PROPOSAL]: {
        eventObject: async (proposalId: string): Promise<any> => (await getProposalById(proposalId)).data(),
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        notifyUserFilter: async (proposal: any): Promise<string[]> => {
            return [proposal.proposerId];
        }
    },
    [EVENT_TYPES.APPROVED_REQUEST_TO_JOIN]: {
        eventObject: async (proposalId: string): Promise<any> => (await getProposalById(proposalId)).data(),
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        notifyUserFilter: async (proposal: any): Promise<string[]> => {
            return [proposal.proposerId];
        }
    },
    [EVENT_TYPES.REJECTED_REQUEST_TO_JOIN]: {
        eventObject: async (proposalId: string): Promise<any> => (await getProposalById(proposalId)).data(),
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        notifyUserFilter: async (proposal: any): Promise<string[]> => {
            return [proposal.proposerId];
        }
    },
    [EVENT_TYPES.REJECTED_PROPOSAL]: {
        eventObject: async (proposalId: string): Promise<any> => (await getProposalById(proposalId)).data(),
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        notifyUserFilter: async (proposal: any): Promise<string[]> => {
            return [proposal.proposerId];
        }
    }
    
}