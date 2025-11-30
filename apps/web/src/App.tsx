import React from 'react';
import { useFirebaseAdmin } from '@bridge/shared/firebase-admin';

function App() {
  console.log(useFirebaseAdmin);
  return (
    <div>
      <h1>Web App</h1>
    </div>
  );
}

export default App;
