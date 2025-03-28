
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import T from '@/components/T';

interface JobNotificationsProps {
  unreadCount: number;
  onMarkAllRead: () => void;
}

const JobNotifications: React.FC<JobNotificationsProps> = ({ 
  unreadCount, 
  onMarkAllRead 
}) => {
  if (unreadCount === 0) return null;

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="border-edu-purple bg-edu-card-bg relative"
        onClick={onMarkAllRead}
      >
        <Bell className="h-4 w-4 mr-1" />
        <T>Notifications</T>
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount}
        </span>
      </Button>
    </div>
  );
};

export default JobNotifications;
