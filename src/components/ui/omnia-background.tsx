
import React from 'react';

const OmniaBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-white">
        {/* OMNIA BOT Typography Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <div className="text-[20vw] font-black text-black select-none leading-none">
            OMNIA
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-3 translate-y-16">
          <div className="text-[12vw] font-black text-gray-800 select-none leading-none">
            BOT
          </div>
        </div>
        
        {/* Subtle geometric patterns */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-32 h-32 border border-gray-200 rotate-45"></div>
          <div className="absolute top-20 right-20 w-24 h-24 border border-gray-100 rotate-12"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 border border-gray-150 -rotate-12"></div>
          <div className="absolute bottom-10 right-10 w-28 h-28 border border-gray-200 rotate-45"></div>
        </div>
      </div>
    </div>
  );
};

export default OmniaBackground;
