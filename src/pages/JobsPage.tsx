
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { useJobs } from '@/hooks/useJobs';
import JobList from '@/components/jobs/JobList';
import JobFormDialog from '@/components/jobs/JobFormDialog';
import JobNotifications from '@/components/jobs/JobNotifications';
import T from '@/components/T';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';

const JobsPage = () => {
  const { user } = useAuth();
  const userId = user?.id;
  
  const isEmployer = user?.user_metadata?.role === 'employer';
  const isStudent = user?.user_metadata?.role === 'student';

  const {
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
    markAllAlertsAsRead,
    resetForm
  } = useJobs(userId);

  // Count unread alerts
  const unreadAlerts = jobAlerts.filter(alert => !alert.read).length;

  const handleMarkAllRead = async () => {
    const count = await markAllAlertsAsRead();
    console.log(`${count} job opportunities marked as read`);
  };

  return (
    <div className="min-h-screen bg-edu-dark text-white pb-20">
      <div className="max-w-md mx-auto px-4 pt-0">
        <Header showBackButton={true} />

        <div className="mt-2 mb-8">
          <div className="flex flex-col justify-center items-center mb-8">
            <h1 className="text-2xl mb-6 font-bold"><T>Job Opportunities</T></h1>
            
            {isEmployer && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => {
                      resetForm();
                      setDialogOpen(true);
                    }} 
                    className="bg-edu-purple hover:bg-edu-purple-dark"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    <T>Add New</T>
                  </Button>
                </DialogTrigger>
                
                <JobFormDialog
                  open={dialogOpen}
                  onOpenChange={setDialogOpen}
                  formData={formData}
                  onInputChange={handleInputChange}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  editingId={editingId}
                />
              </Dialog>
            )}
            
            {isStudent && (
              <JobNotifications 
                unreadCount={unreadAlerts} 
                onMarkAllRead={handleMarkAllRead} 
              />
            )}
          </div>

          <JobList 
            loading={loading}
            jobMaterials={jobMaterials}
            jobAlerts={jobAlerts}
            userId={userId}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default JobsPage;
