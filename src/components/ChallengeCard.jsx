
import React from 'react';

const ChallengeCard = ({ challenge }) => {
    // In a real app, you would get the user from your auth context
    const isUserLoggedIn = false; // or true
  
    return (
      <div className="border p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-bold">{challenge.title}</h2>
        <p className="text-gray-600">{challenge.description}</p>
        <div className="mt-4">
            <p className="font-semibold">Client:</p>
            <p>{isUserLoggedIn ? challenge.clientName : challenge.publicAlias}</p>
        </div>
      </div>
    );
  };

export default ChallengeCard;
