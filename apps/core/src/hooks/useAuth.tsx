import { createContext, useContext, useState } from 'react';
import { User } from '@bounty-board/shared/schemas';

const AuthContext = createContext<{ user: User | null; setUser: (user: User | null) => void; }>({ user: null, setUser: () => {} });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>({ id: '1', role: 'admin', status: 'verified', gmv_total: 0, ownerId: '1' }); // Hardcoded user

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);