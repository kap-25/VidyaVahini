
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

type JobFormData = {
  title: string;
  description: string;
  type: string;
  company: string;
  location: string;
  requirements: string;
  application_url: string;
  deadline: string;
}

export const useJobs = (userId?: string) => {
  const [jobMaterials, setJobMaterials] = useState<JobMaterial[]>([]);
  const [jobAlerts, setJobAlerts] = useState<JobAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    type: 'job',
    company: '',
    location: '',
    requirements: '',
    application_url: '',
    deadline: '',
  });

  useEffect(() => {
    fetchJobMaterials();
    if (userId) {
      fetchJobAlerts();
    }
  }, [userId]);

  const fetchJobMaterials = async () => {
    try {
      setLoading(true);
      console.log("Fetching all jobs...");
      
      const { data, error } = await supabase
        .from('job_materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobMaterials(data || []);
      console.log("Jobs fetched:", data?.length || 0);
    } catch (error: any) {
      console.error('Error fetching job materials:', error);
      toast.error('Failed to load job materials');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobAlerts = async () => {
    try {
      if (!userId) return;
      
      const { data, error } = await supabase
        .from('job_alerts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobAlerts(data || []);
      console.log("Fetched job alerts:", data?.length || 0);
    } catch (error: any) {
      console.error('Error fetching job alerts:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'job',
      company: '',
      location: '',
      requirements: '',
      application_url: '',
      deadline: '',
    });
    setEditingId(null);
  };

  const createJobAlerts = async (jobId: string) => {
    try {
      console.log("Creating job alerts for job ID:", jobId);
      
      // Get all student profiles - we'll need to get all users with role 'student'
      const { data: studentProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id');

      if (profilesError) {
        console.error('Error fetching student profiles:', profilesError);
        throw profilesError;
      }
      
      console.log("Found student profiles:", studentProfiles?.length || 0);
      
      if (studentProfiles && studentProfiles.length > 0) {
        // Create alerts for all students
        const alerts = studentProfiles.map((profile) => ({
          job_id: jobId,
          user_id: profile.id,
          read: false
        }));
        
        console.log("Creating alerts for students:", alerts.length);
        
        const { error: alertsError } = await supabase
          .from('job_alerts')
          .insert(alerts);
          
        if (alertsError) {
          console.error('Error creating job alerts:', alertsError);
          throw alertsError;
        }
        
        console.log('Job alerts created successfully for students');
        return true;
      } else {
        console.log('No student profiles found to create alerts for');
        return false;
      }
    } catch (error: any) {
      console.error('Error in createJobAlerts function:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error('You must be logged in to post job materials');
      return;
    }

    try {
      setIsSubmitting(true);

      const jobData = {
        ...formData,
        created_by: userId,
      };

      let response;

      if (editingId) {
        response = await supabase
          .from('job_materials')
          .update(jobData)
          .eq('id', editingId)
          .select();
      } else {
        response = await supabase
          .from('job_materials')
          .insert([jobData])
          .select();
      }

      const { data, error } = response;

      if (error) {
        console.error('Error submitting job:', error);
        throw error;
      }

      console.log("Job data response:", data);

      // If this is a new job (not an edit), create alerts for all students
      if (!editingId && data && data.length > 0) {
        const alertsCreated = await createJobAlerts(data[0].id);
        if (alertsCreated) {
          toast.success('Job posted and students have been notified!');
        } else {
          toast.success('Job posted successfully');
          console.log('Alerts not created - possibly no students found');
        }
      } else {
        toast.success(editingId ? 'Job material updated successfully' : 'Job material added successfully');
      }
      
      resetForm();
      setDialogOpen(false);
      fetchJobMaterials();
    } catch (error: any) {
      console.error('Error submitting job material:', error);
      toast.error(error.message || 'Failed to submit job material');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (job: JobMaterial) => {
    setFormData({
      title: job.title,
      description: job.description,
      type: job.type,
      company: job.company,
      location: job.location || '',
      requirements: job.requirements || '',
      application_url: job.application_url || '',
      deadline: job.deadline ? job.deadline.split('T')[0] : '',
    });
    setEditingId(job.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this job material?')) {
      try {
        console.log("Deleting job with ID:", id);
        
        // Delete job material (cascade will delete associated alerts)
        const { error } = await supabase
          .from('job_materials')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting job:', error);
          throw error;
        }

        toast.success('Job material deleted successfully');
        fetchJobMaterials();
        if (userId) {
          fetchJobAlerts();
        }
      } catch (error: any) {
        console.error('Error deleting job material:', error);
        toast.error(error.message || 'Failed to delete job material');
      }
    }
  };

  const markAlertAsRead = async (alertId: string) => {
    try {
      console.log("Marking alert as read:", alertId);
      
      const { error } = await supabase
        .from('job_alerts')
        .update({ read: true })
        .eq('id', alertId);
        
      if (error) {
        console.error('Error marking alert as read:', error);
        throw error;
      }
      
      // Update local state
      setJobAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId ? { ...alert, read: true } : alert
        )
      );
      
      console.log("Alert marked as read successfully");
    } catch (error: any) {
      console.error('Error marking alert as read:', error);
    }
  };

  const markAllAlertsAsRead = async () => {
    const unreadAlerts = jobAlerts.filter(alert => !alert.read);
    for (const alert of unreadAlerts) {
      await markAlertAsRead(alert.id);
    }
    return unreadAlerts.length;
  };

  return {
    jobMaterials,
    jobAlerts,
    loading,
    formData,
    isSubmitting,
    dialogOpen,
    editingId,
    setDialogOpen,
    handleInputChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    markAlertAsRead,
    markAllAlertsAsRead,
    resetForm
  };
};
