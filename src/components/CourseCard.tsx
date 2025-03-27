
import React from 'react';
import { Clock } from 'lucide-react';
import ProgressBar from './ProgressBar';

interface CourseCardProps {
  title: string;
  progress: number;
  timeLeft: string;
  className?: string;
}

const CourseCard: React.FC<CourseCardProps> = ({ 
  title, 
  progress, 
  timeLeft,
  className 
}) => {
  return (
    <div className={`bg-edu-card-bg p-4 rounded-xl mb-3 ${className || ''}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-white font-medium">{title}</h3>
        <span className="text-white font-semibold">{progress}%</span>
      </div>
      <ProgressBar progress={progress} className="mb-2" />
      <div className="flex items-center text-muted-foreground text-sm">
        <Clock size={14} className="mr-1" />
        <span>{timeLeft} left</span>
      </div>
    </div>
  );
};

export default CourseCard;
