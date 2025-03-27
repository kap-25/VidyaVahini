
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  progress: number;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, className }) => {
  return (
    <Progress 
      value={progress} 
      className={`h-2 ${className || ''}`}
    />
  );
};

export default ProgressBar;
