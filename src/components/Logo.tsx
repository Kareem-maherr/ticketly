import React from 'react';
import { FaAmbulance, FaHeartbeat, FaHome, FaFire } from 'react-icons/fa';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative flex items-center justify-center bg-red-50 w-10 h-10 rounded-lg">
        <FaHome className="text-red-600 text-2xl" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
          <FaFire className="text-red-600 text-xs animate-pulse" />
        </div>
      </div>
      <div className="ml-3 leading-none">
        <div className="text-base font-bold text-gray-900 tracking-tight">Arab Emergency</div>
        <div className="text-xs font-medium text-red-600 mt-0.5">Ticketing System</div>
      </div>
    </div>
  );
};

export default Logo;
