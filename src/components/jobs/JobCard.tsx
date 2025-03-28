
import React, { useState } from 'react';
import { Edit, Trash2, MapPin, Calendar, Globe, Check, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import T from '@/components/T';

type JobMaterial = {
  id: string;
  title: string;
  description: string;
  type: string;
  company: string;
  location: string;
  requirements: string;
  application_url: string;
  deadline: string;
  created_at: string;
  created_by: string;
}

interface JobCardProps {
  job: JobMaterial;
  canEdit: boolean;
  hasUnreadAlert: boolean;
  onEdit: (job: JobMaterial) => void;
  onDelete: (id: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  canEdit,
  hasUnreadAlert,
  onEdit,
  onDelete
}) => {
  const { user } = useAuth();
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const isStudent = user?.user_metadata?.role === 'student';
  
  // Check if user has already applied for this job
  React.useEffect(() => {
    if (user && isStudent) {
      checkApplicationStatus();
    }
  }, [user, job.id]);
  
  const checkApplicationStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('job_id', job.id)
        .eq('user_id', user?.id)
        .single();
        
      if (data) {
        setHasApplied(true);
      }
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };
  
  const handleApply = async () => {
    if (!user) {
      toast.error('You must be logged in to apply for jobs');
      return;
    }

    try {
      setIsApplying(true);
      
      // Create application record
      const { data: applicationData, error: applicationError } = await supabase
        .from('job_applications')
        .insert([
          { job_id: job.id, user_id: user.id }
        ])
        .select();
        
      if (applicationError) throw applicationError;
      
      // Create notification for the employer
      const { error: notificationError } = await supabase
        .from('employer_notifications')
        .insert([
          { 
            employer_id: job.created_by, 
            job_id: job.id, 
            student_id: user.id,
            message: `A student has applied to your job: ${job.title}`
          }
        ]);
        
      if (notificationError) throw notificationError;
      
      setHasApplied(true);
      toast.success('Application submitted successfully');
    } catch (error: any) {
      console.error('Error applying for job:', error);
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div 
      className={`bg-edu-card-bg rounded-lg p-4 relative ${hasUnreadAlert ? 'border-l-4 border-edu-purple' : ''}`}
    >
      {hasUnreadAlert && (
        <div className="absolute top-2 right-2">
          <span className="inline-block h-3 w-3 bg-edu-purple rounded-full animate-pulse"></span>
        </div>
      )}
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="inline-block px-2 py-1 bg-edu-purple/20 text-xs rounded mb-2">
            {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
          </span>
          <h3 className="text-lg font-bold">{job.title}</h3>
          <p className="text-sm text-muted-foreground mb-2">{job.company}</p>
        </div>
        
        {canEdit && (
          <div className="flex space-x-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onEdit(job)}
              className="h-7 w-7"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDelete(job.id)}
              className="h-7 w-7 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      <p className="text-sm mb-3 line-clamp-2">{job.description}</p>
      
      <div className="space-y-1 text-xs text-muted-foreground mb-3">
        {job.location && (
          <div className="flex items-center">
            <MapPin className="h-3.5 w-3.5 mr-1.5" />
            <span>{job.location}</span>
          </div>
        )}
        
        {job.deadline && (
          <div className="flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
          </div>
        )}
      </div>
      
      <div className="mt-3 flex flex-wrap gap-2">
        {job.application_url && (
          <a 
            href={job.application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-edu-purple hover:underline"
          >
            <Globe className="h-4 w-4 mr-1" />
            <T>Apply on Website</T>
          </a>
        )}
        
        {isStudent && !hasApplied && (
          <Button 
            onClick={handleApply} 
            disabled={isApplying}
            className="bg-edu-purple hover:bg-edu-purple-dark text-white text-sm"
            size="sm"
          >
            {isApplying ? (
              <>
                <Briefcase className="h-4 w-4 mr-1 animate-pulse" />
                <T>Applying...</T>
              </>
            ) : (
              <>
                <Briefcase className="h-4 w-4 mr-1" />
                <T>Apply Now</T>
              </>
            )}
          </Button>
        )}
        
        {isStudent && hasApplied && (
          <Button 
            disabled
            variant="outline"
            className="border-green-500 text-green-500 text-sm"
            size="sm"
          >
            <Check className="h-4 w-4 mr-1" />
            <T>Application Submitted</T>
          </Button>
        )}
      </div>
    </div>
  );
};

export default JobCard;
