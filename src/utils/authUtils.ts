import { api } from '../services/mockConvex';
import { User } from '../types';

/**
 * Authenticate user against Convex residents table
 * This function should be called from components that have access to useQuery
 */
export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
  try {
    // This would need to be called from a component with useQuery
    // For now, we'll return null to indicate authentication is required
    // In a real implementation, this would call the Convex authenticate query
    return null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
};

/**
 * Get user by email from Convex
 * This function should be called from components that have access to useQuery
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    // This would need to be called from a component with useQuery
    // For now, we'll return null to indicate user lookup is required
    // In a real implementation, this would call the Convex getByEmail query
    return null;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
};
