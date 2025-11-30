'use client';

import React from 'react';

interface PlaceholderViewProps {
  title: string;
  icon: string;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({ title, icon }) => {
  return (
    <div className="p-8 flex items-center justify-center h-full">
      <div className="text-center">
        <div className="text-6xl mb-4">{icon}</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-500">Questa sezione sarà disponibile a breve</p>
      </div>
    </div>
  );
};

export default PlaceholderView;
