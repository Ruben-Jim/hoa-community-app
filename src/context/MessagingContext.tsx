import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, api } from '../services/mockConvex';
import { useAuth } from './AuthContext';

// Use string for demo mode instead of Id types
type ConversationId = string;
type MessageId = string;

interface Conversation {
  _id: ConversationId;
  participants: string[];
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  latestMessage?: {
    _id: MessageId;
    conversationId: ConversationId;
    senderId: string;
    senderName: string;
    senderRole: string;
    content: string;
    createdAt: number;
  } | null;
  otherParticipant?: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
    isBoardMember: boolean;
  } | null;
}

interface Message {
  _id: MessageId;
  conversationId: ConversationId;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  createdAt: number;
}

interface MessagingContextType {
  conversations: Conversation[];
  isLoading: boolean;
  openConversation: (conversationId: ConversationId | null) => void;
  activeConversationId: ConversationId | null;
  activeConversationMessages: Message[];
  sendMessage: (content: string) => Promise<void>;
  createConversationWithUser: (recipientId: string) => Promise<ConversationId | null>;
  hasUnreadMessages: boolean;
  latestMessagePreview: string | null;
  showOverlay: boolean;
  setShowOverlay: (show: boolean) => void;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const MessagingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeConversationId, setActiveConversationId] = useState<ConversationId | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  // Queries
  const conversations = useQuery(
    api.messages.getUserConversations,
    user ? { userId: user._id } : "skip"
  ) || [];

  const activeConversationMessages = useQuery(
    api.messages.getConversationMessages,
    activeConversationId ? { conversationId: activeConversationId } : "skip"
  ) || [];

  // Mutations
  const createConversation = useMutation(api.messages.createConversation);
  const sendMessageMutation = useMutation(api.messages.sendMessage);

  // Check for unread messages (for non-board users)
  const hasUnreadMessages = React.useMemo(() => {
    if (!user || user.isBoardMember) return false;
    return conversations.length > 0;
  }, [conversations, user]);

  // Get latest message preview for minimized bubble
  const latestMessagePreview = React.useMemo(() => {
    if (conversations.length === 0) return null;
    const latestConv = conversations[0];
    return latestConv.latestMessage?.content || null;
  }, [conversations]);

  const openConversation = useCallback((conversationId: ConversationId | null) => {
    setActiveConversationId(conversationId);
  }, []);

  const createConversationWithUser = useCallback(async (recipientId: string): Promise<ConversationId | null> => {
    if (!user || !user.isBoardMember) return null;

    try {
      const conversationId = await createConversation({
        boardMemberId: user._id,
        boardMemberName: `${user.firstName} ${user.lastName}`,
        recipientId,
      });
      setActiveConversationId(conversationId);
      return conversationId;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  }, [user, createConversation]);

  const sendMessage = useCallback(async (content: string) => {
    if (!activeConversationId || !user || !content.trim()) return;

    try {
      const senderName = user.isBoardMember
        ? "Shelton Springs Board"
        : `${user.firstName} ${user.lastName}`;
      
      const senderRole = user.isBoardMember
        ? `${user.firstName} ${user.lastName}`
        : user.isRenter
        ? "Renter"
        : "Homeowner";

      await sendMessageMutation({
        conversationId: activeConversationId,
        senderId: user._id,
        senderName,
        senderRole,
        content: content.trim(),
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [activeConversationId, user, sendMessageMutation]);

  const value: MessagingContextType = {
    conversations,
    isLoading: conversations === undefined,
    openConversation,
    activeConversationId,
    activeConversationMessages,
    sendMessage,
    createConversationWithUser,
    hasUnreadMessages,
    latestMessagePreview,
    showOverlay,
    setShowOverlay,
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};

