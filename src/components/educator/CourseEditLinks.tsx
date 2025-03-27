
import React from 'react';
import { Link } from 'react-router-dom';
import { Edit, FileEdit, Play, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CourseEditLinksProps {
  courseId: string;
}

const CourseEditLinks: React.FC<CourseEditLinksProps> = ({ courseId }) => {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <Button asChild variant="outline" size="sm" className="flex items-center">
        <Link to={`/courses/${courseId}/edit-content`}>
          <FileEdit size={16} className="mr-2" />
          Edit Materials
        </Link>
      </Button>
      
      <Button asChild variant="outline" size="sm" className="flex items-center">
        <Link to={`/courses/${courseId}/edit-learn`}>
          <BookOpen size={16} className="mr-2" />
          Edit Course Structure
        </Link>
      </Button>
      
      <Button asChild variant="outline" size="sm" className="flex items-center">
        <Link to={`/courses/${courseId}/learn`}>
          <Play size={16} className="mr-2" />
          Preview Course
        </Link>
      </Button>
    </div>
  );
};

export default CourseEditLinks;
