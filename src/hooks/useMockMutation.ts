import { useState, useCallback } from 'react';
import {
  getMockState,
  updateMockState,
  generateId,
} from '../services/mockData';

// Mock mutation hook that mimics Convex's useMutation
export function useMockMutation<T = any>(
  mutationFn: string | ((args?: any) => Promise<T>)
): (args?: any) => Promise<T> {
  const [isLoading, setIsLoading] = useState(false);

  return useCallback(
    async (args?: any): Promise<T> => {
      setIsLoading(true);
      
      try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 300));

        const state = getMockState();
        let mutationPath: string;
        
        if (typeof mutationFn === 'string') {
          mutationPath = mutationFn;
        } else {
          // Extract mutation path
          mutationPath = mutationFn as any;
        }
        
        let result: T;

        // Handle different mutation types
        if (mutationPath.includes('residents.create') || mutationPath === 'residents.create') {
          const newResident = {
            _id: generateId(),
            ...args,
            isActive: true,
            isBlocked: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          updateMockState({
            residents: [...state.residents, newResident],
          });
          result = newResident._id as T;
        } else if (mutationPath.includes('residents.update') || mutationPath === 'residents.update') {
          const residents = state.residents.map((r: any) =>
            r._id === args.id ? { ...r, ...args, updatedAt: Date.now() } : r
          );
          updateMockState({ residents });
          result = undefined as T;
        } else if (mutationPath.includes('residents.setBlockStatus') || mutationPath === 'residents.setBlockStatus') {
          const residents = state.residents.map((r: any) =>
            r._id === args.id
              ? { ...r, isBlocked: args.isBlocked, blockReason: args.reason, updatedAt: Date.now() }
              : r
          );
          updateMockState({ residents });
          result = undefined as T;
        } else if (mutationPath.includes('boardMembers.create') || mutationPath === 'boardMembers.create') {
          const newMember = {
            _id: generateId(),
            ...args,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          updateMockState({
            boardMembers: [...state.boardMembers, newMember],
          });
          result = newMember._id as T;
        } else if (mutationPath.includes('boardMembers.update') || mutationPath === 'boardMembers.update') {
          const boardMembers = state.boardMembers.map((m: any) =>
            m._id === args.id ? { ...m, ...args, updatedAt: Date.now() } : m
          );
          updateMockState({ boardMembers });
          result = undefined as T;
        } else if (mutationPath.includes('boardMembers.remove') || mutationPath === 'boardMembers.remove') {
          const boardMembers = state.boardMembers.filter((m: any) => m._id !== args.id);
          updateMockState({ boardMembers });
          result = undefined as T;
        } else if (mutationPath.includes('communityPosts.create') || mutationPath === 'communityPosts.create') {
          const newPost = {
            _id: generateId(),
            ...args,
            likes: 0,
            comments: [],
            images: args.images || [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          updateMockState({
            communityPosts: [...state.communityPosts, newPost],
          });
          result = newPost._id as T;
        } else if (mutationPath.includes('communityPosts.addComment') || mutationPath === 'communityPosts.addComment') {
          const posts = state.communityPosts.map((p: any) => {
            if (p._id === args.postId) {
              const newComment = {
                _id: generateId(),
                author: args.author,
                authorProfileImage: args.authorProfileImage,
                content: args.content,
                createdAt: Date.now(),
                timestamp: new Date().toISOString(),
              };
              return {
                ...p,
                comments: [...(p.comments || []), newComment],
                updatedAt: Date.now(),
              };
            }
            return p;
          });
          updateMockState({ communityPosts: posts });
          result = undefined as T;
        } else if (mutationPath.includes('communityPosts.like') || mutationPath === 'communityPosts.like') {
          const posts = state.communityPosts.map((p: any) =>
            p._id === args.postId
              ? { ...p, likes: (p.likes || 0) + 1, updatedAt: Date.now() }
              : p
          );
          updateMockState({ communityPosts: posts });
          result = undefined as T;
        } else if (mutationPath.includes('communityPosts.remove') || mutationPath === 'communityPosts.remove') {
          const communityPosts = state.communityPosts.filter((p: any) => p._id !== args.id);
          updateMockState({ communityPosts });
          result = undefined as T;
        } else if (mutationPath.includes('communityPosts.removeComment') || mutationPath === 'communityPosts.removeComment') {
          const posts = state.communityPosts.map((p: any) => {
            if (p._id === args.postId) {
              return {
                ...p,
                comments: (p.comments || []).filter((c: any) => c._id !== args.commentId),
                updatedAt: Date.now(),
              };
            }
            return p;
          });
          updateMockState({ communityPosts: posts });
          result = undefined as T;
        } else if (mutationPath.includes('polls.vote') || mutationPath === 'polls.vote') {
          const polls = state.polls.map((p: any) => {
            if (p._id === args.pollId) {
              const optionVotes = { ...(p.optionVotes || {}) };
              args.selectedOptions.forEach((optIdx: number) => {
                optionVotes[optIdx] = (optionVotes[optIdx] || 0) + 1;
              });
              const totalVotes = Object.values(optionVotes).reduce((a: number, b: number) => a + b, 0);
              return {
                ...p,
                optionVotes,
                totalVotes,
                updatedAt: Date.now(),
              };
            }
            return p;
          });
          updateMockState({ polls });
          result = undefined as T;
        } else if (mutationPath.includes('residentNotifications.create') || mutationPath === 'residentNotifications.create') {
          const newNotif = {
            _id: generateId(),
            ...args,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          updateMockState({
            notifications: [...state.notifications, newNotif],
          });
          result = newNotif._id as T;
        } else if (mutationPath.includes('residentNotifications.update') || mutationPath === 'residentNotifications.update') {
          const notifications = state.notifications.map((n: any) =>
            n._id === args.id ? { ...n, ...args, updatedAt: Date.now() } : n
          );
          updateMockState({ notifications });
          result = undefined as T;
        } else if (mutationPath.includes('residentNotifications.remove') || mutationPath === 'residentNotifications.remove') {
          const notifications = state.notifications.filter((n: any) => n._id !== args.id);
          updateMockState({ notifications });
          result = undefined as T;
        } else if (mutationPath.includes('pets.create') || mutationPath === 'pets.create') {
          const newPet = {
            _id: generateId(),
            ...args,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          updateMockState({
            pets: [...state.pets, newPet],
          });
          result = newPet._id as T;
        } else if (mutationPath.includes('pets.update') || mutationPath === 'pets.update') {
          const pets = state.pets.map((p: any) =>
            p._id === args.id ? { ...p, ...args, updatedAt: Date.now() } : p
          );
          updateMockState({ pets });
          result = undefined as T;
        } else if (mutationPath.includes('pets.remove') || mutationPath === 'pets.remove') {
          const pets = state.pets.filter((p: any) => p._id !== args.id);
          updateMockState({ pets });
          result = undefined as T;
        } else if (mutationPath.includes('covenants.remove') || mutationPath === 'covenants.remove') {
          const covenants = state.covenants.filter((c: any) => c._id !== args.id);
          updateMockState({ covenants });
          result = undefined as T;
        } else if (mutationPath.includes('emergencyNotifications.create') || mutationPath === 'emergencyNotifications.create') {
          const newEmergency = {
            _id: generateId(),
            ...args,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          updateMockState({
            emergencyNotifications: [...state.emergencyNotifications, newEmergency],
          });
          result = newEmergency._id as T;
        } else if (mutationPath.includes('documents.create') || mutationPath === 'documents.create') {
          const newDoc = {
            _id: generateId(),
            ...args,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          updateMockState({
            documents: [...state.documents, newDoc],
          });
          result = newDoc._id as T;
        } else if (mutationPath.includes('documents.remove') || mutationPath === 'documents.remove') {
          const documents = state.documents.filter((d: any) => d._id !== args.id);
          updateMockState({ documents });
          result = undefined as T;
        } else if (mutationPath.includes('storage.generateUploadUrl') || mutationPath === 'storage.generateUploadUrl') {
          // Return a mock upload URL
          result = `https://mock-upload-url.com/${generateId()}` as T;
        } else if (mutationPath.includes('storage.getUrl') || mutationPath === 'storage.getUrl') {
          // Return undefined for demo (no images)
          result = undefined as T;
        } else if (mutationPath.includes('storage.deleteStorageFile') || mutationPath === 'storage.deleteStorageFile') {
          // No-op for demo
          result = undefined as T;
        } else {
          // Default: return args as result
          result = args as T;
        }

        setIsLoading(false);
        return result;
      } catch (error) {
        setIsLoading(false);
        throw error;
      }
    },
    [mutationFn]
  );
}

