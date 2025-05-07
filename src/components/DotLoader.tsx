
import React from 'react';

const DotLoader = () => {
  return (
    <div className="min-h-screen bg-tech-dark flex flex-col items-center justify-center">
      <div className="flex items-center justify-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-tech-blue animate-[bounce_1.4s_infinite_ease-in-out_0s]"></div>
        <div className="w-3 h-3 rounded-full bg-tech-blue animate-[bounce_1.4s_infinite_ease-in-out_0.2s]"></div>
        <div className="w-3 h-3 rounded-full bg-tech-blue animate-[bounce_1.4s_infinite_ease-in-out_0.4s]"></div>
      </div>
      <div className="mt-4 text-tech-blue font-medium">Initializing</div>
    </div>
  );
};

export default DotLoader;
