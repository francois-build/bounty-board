import React from 'react';
import Layout from '../components/Layout';
import { CORE_URL } from '@bounty-board/shared/config';

const Home = () => {
  return (
    <Layout>
      <div className="text-center py-24">
        <h1 className="text-5xl font-bold text-slate-900">The Operating System for Corporate Innovation.</h1>
        <p className="text-xl text-slate-600 mt-4">Match with enterprise challenges, fast-track diligence, and secure pilots.</p>
        <div className="mt-8">
          <a href={`${CORE_URL}/signup`} className="bg-slate-900 text-white px-8 py-3 rounded-md shadow-lg active:scale-98 text-lg font-semibold">Find a Pilot</a>
          <a href={`${CORE_URL}/sandbox`} className="ml-4 text-slate-600 hover:text-slate-900">Try Demo</a>
        </div>
        <div className="mt-16 text-slate-500 opacity-60">
          Trusted by [Logo Placeholder] [Logo Placeholder]
        </div>
      </div>
    </Layout>
  );
};

export default Home;
