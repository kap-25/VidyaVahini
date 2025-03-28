
import React from 'react';
import { Loader2, Briefcase } from 'lucide-react';
import JobCard from './JobCard';
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

type JobAlert = {
  id: string;
  job_id: string;
  user_id: string;
  read: boolean;
  created_at: string;
}

interface JobListProps {
  loading: boolean;
  jobMaterials: JobMaterial[];
  jobAlerts: JobAlert[];
  userId?: string;
  onEdit: (job: JobMaterial) => void;
  onDelete: (id: string) => void;
}

const JobList: React.FC<JobListProps> = ({ 
  loading, 
  jobMaterials, 
  jobAlerts, 
  userId, 
  onEdit, 
  onDelete 
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 text-edu-purple animate-spin" />
      </div>
    );
  }

  if (jobMaterials.length === 0) {
    return (
      <div className="text-center py-12 bg-edu-card-bg rounded-lg">
        <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2"><T>No job opportunities yet</T></h3>
        <p className="text-muted-foreground">
          <T>Check back later for new opportunities</T>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobMaterials.map((job) => {
        // Check if there's an unread alert for this job
        const hasUnreadAlert = jobAlerts.some(
          alert => alert.job_id === job.id && !alert.read
        );
        
        // Check if the current user can edit this job
        const canEdit = userId === job.created_by;
        
        return (
          <JobCard
            key={job.id}
            job={job}
            canEdit={canEdit}
            hasUnreadAlert={hasUnreadAlert}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      })}
    </div>
  );
};

export default JobList;
