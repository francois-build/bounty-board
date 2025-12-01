import React from 'react';
import { CORE_URL } from '@bounty-board/shared/config';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ backgroundColor: '#f1f5f9' }} className="min-h-screen">
      <nav className="flex items-center justify-between p-6">
        <div>
          <a href="/" className="font-mono font-bold text-xl">Bridge</a>
        </div>
        <div className="flex items-center space-x-4">
          <a href="/government" className="text-slate-600 hover:text-slate-900">For Governments</a>
          <a href={`${CORE_URL}/login`} className="text-slate-600 hover:text-slate-900">Login</a>
          <a href={`${CORE_URL}/signup`} className="bg-slate-900 text-white px-4 py-2 rounded-md shadow-lg active:scale-98">Get Started</a>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
