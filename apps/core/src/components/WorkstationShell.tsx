import React from 'react';

interface WorkstationShellProps {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export const WorkstationShell = ({ title, actions, children }: WorkstationShellProps) => {
  return (
    <div className="flex flex-col h-screen bg-slate-100">
      <header className="flex items-center justify-between p-4 bg-white border-b border-slate-200">
        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
        <div className="flex items-center space-x-4">
          {actions}
        </div>
      </header>
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};