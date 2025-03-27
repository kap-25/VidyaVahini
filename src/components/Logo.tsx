
import React from 'react';
import { GraduationCap } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ className, size = 24 }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <GraduationCap size={size} className="mr-2 text-edu-purple" />
      <span className="font-bold text-white">EduForAll</span>
    </div>
  );
};

export default Logo;
