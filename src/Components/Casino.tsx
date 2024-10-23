import React from 'react';

import background from '../Resources/Backgrounds/StaryMountians.jpg'; // Replace with your actual background image path

const Casino: React.FC = () => {
  return (
    <div className="relative flex flex-col items-center justify-center flex-grow h-full bg-gray-900 text-white p-8" style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center w-3/4 h-3/4">
        <h1 className="text-4xl font-bold mb-8">Casino</h1>
        <p className="text-lg">This is the Casino component, centered in the middle of the page.</p>
      </div>
    </div>
  );
};

export default Casino;