
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Welcome to the Bounty Board</h1>
      <p>The best place to find and post challenges.</p>
      <Link to="/browse" className="text-blue-500 hover:underline">
        Browse Challenges
      </Link>
    </div>
  );
};

export default Home;
