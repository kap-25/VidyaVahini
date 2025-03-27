
import React from 'react';
import { Clock } from 'lucide-react';

interface RecommendedCourseCardProps {
  title: string;
  description: string;
  duration: string;
  imageUrl: string;
  className?: string;
}

const RecommendedCourseCard: React.FC<RecommendedCourseCardProps> = ({
  title,
  description,
  duration,
  imageUrl,
  className
}) => {
  return (
    <div className={`bg-edu-card-bg rounded-xl overflow-hidden ${className || ''}`}>
      <div className="relative">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-32 object-cover"
        />
        <div className="absolute bottom-2 right-2 bg-black/70 rounded-md px-2 py-1 flex items-center">
          <Clock size={14} className="mr-1 text-white" />
          <span className="text-white text-xs">{duration}</span>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-white text-sm">{title}</h3>
        <p className="text-muted-foreground text-xs mt-1">{description}</p>
      </div>
    </div>
  );
};

export default RecommendedCourseCard;
