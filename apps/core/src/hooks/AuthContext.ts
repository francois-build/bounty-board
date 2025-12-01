import { createContext } from 'react';
import { User as AuthUser } from 'firebase/auth';
import { User as UserProfile } from '@bounty-board/shared/schemas';

export interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });
