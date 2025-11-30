import React from 'react';
import Layout from '../components/Layout';

const Government = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = (e.target as any).email.value;
    console.log(`Email captured: ${email}`);
    alert(`Report unlocked for ${email}! (Check console)`);
  };

  return (
    <Layout>
      <div className="text-center py-24">
        <h1 className="text-4xl font-bold text-slate-900">Download the National Innovation Index.</h1>
        <form onSubmit={handleSubmit} className="mt-8">
          <input type="email" name="email" placeholder="Enter your email" className="px-4 py-2 border rounded-md" />
          <button type="submit" className="bg-slate-900 text-white px-8 py-2 rounded-md shadow-lg active:scale-98 ml-4">Unlock Report</button>
        </form>
      </div>
    </Layout>
  );
};

export default Government;
