import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation } from 'convex/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../convex/_generated/api';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  signIn: (user: User) => Promise<void>;
  signUp: (userData: Omit<User, '_id' | 'createdAt' | 'updatedAt' | 'isActive' | 'password'>) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Convex mutations
  const createResident = useMutation(api.residents.create);
  const updateResident = useMutation(api.residents.update);

  useEffect(() => {
    // Check for existing login session on app start
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        console.log('🔄 Restored user from storage:', user.email);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        console.log('📱 No stored user found, showing login screen');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.log('❌ Error loading user from storage:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const signIn = async (user: User) => {
    try {
      // Save user to AsyncStorage for persistent login
      await AsyncStorage.setItem('user', JSON.stringify(user));
      console.log('✅ User logged in and saved to storage:', user.email);
      console.log('👤 User details:', { firstName: user.firstName, lastName: user.lastName, email: user.email });

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (userData: Omit<User, '_id' | 'createdAt' | 'updatedAt' | 'isActive' | 'password'>) => {
    try {
      const residentId = await createResident({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        unitNumber: userData.unitNumber,
        isResident: userData.isResident,
        isBoardMember: userData.isBoardMember,
        password: 'demo123', // In production, this would be hashed
      });

      const newUser: User = {
        ...userData,
        _id: residentId,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Save user to AsyncStorage for persistent login
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      console.log('✅ User signed up and saved to storage:', newUser.email);

      setAuthState({
        user: newUser,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clear user from AsyncStorage
      await AsyncStorage.removeItem('user');
      console.log('👋 User logged out and removed from storage');
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.log('❌ Error during logout:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    try {
      if (!authState.user) return;
      
      await updateResident({
        id: authState.user._id as any,
        ...updates,
      });

      const updatedUser = { ...authState.user, ...updates, updatedAt: Date.now() };
      
      // Update user in AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      setAuthState({
        ...authState,
        user: updatedUser,
      });
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    ...authState,
    signIn,
    signUp,
    signOut,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
