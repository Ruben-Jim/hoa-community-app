// Mock API object that mimics Convex's api structure
// This allows us to use the same syntax: useQuery(api.residents.getAll)

import {
  getResidents,
  getBoardMembers,
  getCommunityPosts,
  getPolls,
  getNotifications,
  getPets,
  getCovenants,
  getFees,
  getFines,
  getHOAInfo,
  getEmergencyNotifications,
  getDocuments,
  getMockState,
} from './mockData';

export const mockApi = {
  residents: {
    getAll: 'residents.getAll',
    getByEmail: 'residents.getByEmail',
    create: 'residents.create',
    update: 'residents.update',
    setBlockStatus: 'residents.setBlockStatus',
  },
  boardMembers: {
    getAll: 'boardMembers.getAll',
    create: 'boardMembers.create',
    update: 'boardMembers.update',
    remove: 'boardMembers.remove',
  },
  communityPosts: {
    getAll: 'communityPosts.getAll',
    getAllComments: 'communityPosts.getAllComments',
    create: 'communityPosts.create',
    addComment: 'communityPosts.addComment',
    like: 'communityPosts.like',
    remove: 'communityPosts.remove',
    removeComment: 'communityPosts.removeComment',
  },
  polls: {
    getAll: 'polls.getAll',
    getAllUserVotes: 'polls.getAllUserVotes',
    vote: 'polls.vote',
  },
  residentNotifications: {
    getAllActive: 'residentNotifications.getAllActive',
    create: 'residentNotifications.create',
    update: 'residentNotifications.update',
    remove: 'residentNotifications.remove',
  },
  pets: {
    getAll: 'pets.getAll',
    create: 'pets.create',
    update: 'pets.update',
    remove: 'pets.remove',
  },
  covenants: {
    getAll: 'covenants.getAll',
    remove: 'covenants.remove',
  },
  fees: {
    getAll: 'fees.getAll',
    getPaginated: 'fees.getPaginated',
    getAllFines: 'fees.getAllFines',
    getAllHomeownersPaymentStatus: 'fees.getAllHomeownersPaymentStatus',
  },
  fines: {
    getAll: 'fines.getAll',
  },
  hoaInfo: {
    get: 'hoaInfo.get',
  },
  emergencyNotifications: {
    getActive: 'emergencyNotifications.getActive',
    getAll: 'emergencyNotifications.getAll',
    create: 'emergencyNotifications.create',
  },
  documents: {
    getAll: 'documents.getAll',
    create: 'documents.create',
    remove: 'documents.remove',
  },
  storage: {
    getUrl: 'storage.getUrl',
    generateUploadUrl: 'storage.generateUploadUrl',
    deleteStorageFile: 'storage.deleteStorageFile',
  },
  payments: {
    getPendingVenmoPayments: 'payments.getPendingVenmoPayments',
  },
};

// Query resolver function
export const resolveQuery = (queryPath: string, args?: any): any => {
  if (queryPath === 'skip') return undefined;

  switch (queryPath) {
    case 'residents.getAll':
      return getResidents();
    case 'residents.getByEmail':
      return getResidents().find((r: any) => r.email === args?.email);
    case 'boardMembers.getAll':
      return getBoardMembers();
    case 'communityPosts.getAll':
      return getCommunityPosts();
    case 'communityPosts.getPaginated':
      const allPosts = getCommunityPosts();
      const limit = args?.limit || 20;
      const offset = args?.offset || 0;
      return {
        items: allPosts.slice(offset, offset + limit),
        total: allPosts.length,
      };
    case 'communityPosts.getAllComments':
      const posts = getCommunityPosts();
      const allComments: any[] = [];
      posts.forEach((post: any) => {
        if (post.comments) {
          allComments.push(...post.comments);
        }
      });
      return allComments;
    case 'polls.getAll':
      return getPolls();
    case 'polls.getPaginated':
      const allPolls = getPolls();
      const pollsLimit = args?.limit || 20;
      const pollsOffset = args?.offset || 0;
      return {
        items: allPolls.slice(pollsOffset, pollsOffset + pollsLimit),
        total: allPolls.length,
      };
    case 'polls.getAllUserVotes':
      return {};
    case 'residentNotifications.getAllActive':
      return getNotifications();
    case 'pets.getAll':
      return getPets();
    case 'covenants.getAll':
      return getCovenants();
    case 'covenants.getPaginated':
      const allCovenants = getCovenants();
      const covenantsLimit = args?.limit || 50;
      const covenantsOffset = args?.offset || 0;
      return {
        items: allCovenants.slice(covenantsOffset, covenantsOffset + covenantsLimit),
        total: allCovenants.length,
      };
    case 'fees.getAll':
      return getFees();
    case 'fees.getPaginated':
      const allFees = getFees();
      const feesLimit = args?.limit || 50;
      const feesOffset = args?.offset || 0;
      return {
        items: allFees.slice(feesOffset, feesOffset + feesLimit),
        total: allFees.length,
      };
    case 'fees.getAllFines':
      // Return all fines (same as fines.getAll)
      return getFines();
    case 'fees.getAllHomeownersPaymentStatus':
      // Return homeowners (residents who are not renters) with payment status
      const allResidents = getResidents();
      const homeowners = allResidents.filter((r: any) => r.isResident && !r.isRenter);
      return homeowners.map((homeowner: any) => ({
        _id: homeowner._id,
        firstName: homeowner.firstName,
        lastName: homeowner.lastName,
        email: homeowner.email,
        phone: homeowner.phone,
        address: homeowner.address,
        unitNumber: homeowner.unitNumber,
        profileImage: homeowner.profileImage,
        isBoardMember: homeowner.isBoardMember,
        isActive: homeowner.isActive,
      }));
    case 'fines.getAll':
      return getFines();
    case 'hoaInfo.get':
      return getHOAInfo();
    case 'emergencyNotifications.getActive':
      return getEmergencyNotifications().filter((n: any) => n.isActive);
    case 'emergencyNotifications.getAll':
      return getEmergencyNotifications();
    case 'documents.getAll':
      return getDocuments();
    case 'storage.getUrl':
      return undefined;
    case 'messages.getUserConversations':
      // Get conversations from state where user is a participant
      const state = getMockState();
      const userId = args?.userId;
      if (!userId) return [];
      return (state.conversations || []).filter((conv: any) =>
        conv.participants.includes(userId)
      );
    case 'messages.getConversationMessages':
      // Get messages for a conversation
      const mockState = getMockState();
      const conversationId = args?.conversationId;
      if (!conversationId) return [];
      return (mockState.messages || []).filter(
        (msg: any) => msg.conversationId === conversationId
      ).sort((a: any, b: any) => a.createdAt - b.createdAt);
    case 'payments.getPendingVenmoPayments':
      // Return empty array for demo (no pending payments by default)
      return [];
    default:
      return undefined;
  }
};

