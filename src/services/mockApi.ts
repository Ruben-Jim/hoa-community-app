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
    case 'polls.getAllUserVotes':
      return {};
    case 'residentNotifications.getAllActive':
      return getNotifications();
    case 'pets.getAll':
      return getPets();
    case 'covenants.getAll':
      return getCovenants();
    case 'fees.getAll':
      return getFees();
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
    default:
      return undefined;
  }
};

