
import React from 'react';
import { User, Calendar, Briefcase, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import T from '@/components/T';

type Notification = {
  id: string;
  job_id: string;
  student_id: string;
  message: string;
  read: boolean;
  created_at: string;
  job?: {
    title: string;
    company: string;
  };
  student?: {
    username: string;
    email: string;
  };
};

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onViewJob: (jobId: string) => void;
  onViewApplicant: (studentId: string) => void;
}

const EmployerNotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead,
  onViewJob,
  onViewApplicant
}) => {
  const formattedDate = new Date(notification.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Card className={`bg-edu-card-bg border-edu-card-border text-white mb-4 ${
      !notification.read ? 'border-l-4 border-edu-purple' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">
            <Briefcase className="h-4 w-4 inline mr-2 text-edu-purple" />
            {notification.job?.title || 'Job Application'}
          </h3>
          <div className="text-xs text-muted-foreground flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {formattedDate}
          </div>
        </div>
        
        <p className="text-sm mb-3">{notification.message}</p>
        
        <div className="text-xs text-muted-foreground mb-4 flex items-center">
          <User className="h-3 w-3 mr-1" />
          {notification.student?.username || notification.student?.email || 'Student'}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm"
            variant="outline"
            className="border-edu-purple text-edu-purple hover:bg-edu-purple/20"
            onClick={() => onViewJob(notification.job_id)}
          >
            <Briefcase className="h-3.5 w-3.5 mr-1.5" />
            <T>View Job</T>
          </Button>
          
          <Button 
            size="sm"
            variant="outline"
            className="border-edu-purple text-edu-purple hover:bg-edu-purple/20"
            onClick={() => onViewApplicant(notification.student_id)}
          >
            <User className="h-3.5 w-3.5 mr-1.5" />
            <T>View Applicant</T>
          </Button>
          
          {!notification.read && (
            <Button 
              size="sm"
              variant="ghost"
              className="ml-auto text-muted-foreground hover:text-white"
              onClick={() => onMarkAsRead(notification.id)}
            >
              <Check className="h-3.5 w-3.5 mr-1.5" />
              <T>Mark as Read</T>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployerNotificationCard;
