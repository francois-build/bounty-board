import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Assuming you have a firebase config file

interface EventToggleProps {
  challengeId: string;
  initialValue: boolean;
}

const EventToggle: React.FC<EventToggleProps> = ({ challengeId, initialValue }) => {
  const [isBuildEvent, setIsBuildEvent] = useState(initialValue);

  const handleToggle = async () => {
    const newIsBuildEvent = !isBuildEvent;
    setIsBuildEvent(newIsBuildEvent);

    const challengeRef = doc(db, 'challenges', challengeId);
    await updateDoc(challengeRef, {
      isBuildEvent: newIsBuildEvent,
    });
  };

  return (
    <div>
      <label>
        <input type="checkbox" checked={isBuildEvent} onChange={handleToggle} />
        Is Build Event
      </label>
    </div>
  );
};

export default EventToggle;
