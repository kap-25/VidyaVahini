
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Briefcase, Award, Trophy, Loader2, User, Calendar, Mail } from 'lucide-react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import T from '@/components/T';

type JobApplication = {
  id: string;
  job_id: string;
  user_id: string;
  applied_at: string;
  status: string;
  job?: {
    title: string;
    company: string;
    type: string;
  };
  profile_username?: string;
  user_email?: string;
};

const EmployerApplicants = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      
      // First, get job IDs created by the current employer
      const { data: employerJobs, error: jobsError } = await supabase
        .from('job_materials')
        .select('id')
        .eq('created_by', user?.id);
        
      if (jobsError) throw jobsError;
      
      if (!employerJobs || employerJobs.length === 0) {
        setApplications([]);
        setLoading(false);
        return;
      }
      
      const jobIds = employerJobs.map(job => job.id);
      
      // Then get applications for those jobs with job details
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('job_applications')
        .select(`
          *,
          job:job_materials(title, company, type)
        `)
        .in('job_id', jobIds);
      
      if (applicationsError) throw applicationsError;
      
      if (!applicationsData) {
        setApplications([]);
        setLoading(false);
        return;
      }
      
      // For each application, fetch the user profile and email information
      const enhancedApplications = await Promise.all(
        applicationsData.map(async (app) => {
          // Get profile info
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', app.user_id)
            .single();
          
          // Return enhanced application object
          return {
            ...app,
            profile_username: profileData?.username || 'Anonymous',
            user_email: 'Contact via platform' // For privacy, we're not fetching actual emails
          };
        })
      );
      
      setApplications(enhancedApplications);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  // Filter applications by job type
  const jobApplications = applications.filter(app => app.job?.type === 'job');
  const internshipApplications = applications.filter(app => app.job?.type === 'internship');
  const hackathonApplications = applications.filter(app => app.job?.type === 'hackathon');
  
  const updateApplicationStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status })
        .eq('id', id);
        
      if (error) throw error;
      
      setApplications(prev => 
        prev.map(app => app.id === id ? {...app, status} : app)
      );
      
      toast.success(`Application marked as ${status}`);
    } catch (error: any) {
      console.error('Error updating application:', error);
      toast.error('Failed to update status');
    }
  };
  
  const renderApplicantTable = (filteredApplications: JobApplication[]) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 text-edu-purple animate-spin" />
        </div>
      );
    }
    
    if (filteredApplications.length === 0) {
      return (
        <div className="text-center py-12">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            <T>No applicants yet</T>
          </h3>
          <p className="text-muted-foreground">
            <T>Applications will appear here when students apply</T>
          </p>
        </div>
      );
    }
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><T>Applicant</T></TableHead>
            <TableHead><T>Position</T></TableHead>
            <TableHead><T>Date Applied</T></TableHead>
            <TableHead><T>Status</T></TableHead>
            <TableHead><T>Actions</T></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredApplications.map((app) => (
            <TableRow key={app.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{app.profile_username || 'Anonymous'}</span>
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Mail className="h-3 w-3 mr-1" />
                    {app.user_email || 'No email'}
                  </span>
                </div>
              </TableCell>
              <TableCell>{app.job?.title || 'Unknown Position'}</TableCell>
              <TableCell>
                <span className="flex items-center text-sm">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  {new Date(app.applied_at).toLocaleDateString()}
                </span>
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {app.status === 'pending' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() => updateApplicationStatus(app.id, 'accepted')}
                      >
                        <T>Accept</T>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => updateApplicationStatus(app.id, 'rejected')}
                      >
                        <T>Reject</T>
                      </Button>
                    </>
                  )}
                  {app.status !== 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateApplicationStatus(app.id, 'pending')}
                    >
                      <T>Reset</T>
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header showBackButton>
        <h1 className="text-xl font-bold"><T>Applicants</T></h1>
      </Header>
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span><T>Jobs</T></span>
            </TabsTrigger>
            <TabsTrigger value="internships" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span><T>Internships</T></span>
            </TabsTrigger>
            <TabsTrigger value="hackathons" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span><T>Hackathons</T></span>
            </TabsTrigger>
          </TabsList>
          
          <Card>
            <CardContent className="pt-6">
              <TabsContent value="jobs" className="mt-0">
                <h2 className="text-xl font-bold mb-4"><T>Job Applicants</T></h2>
                {renderApplicantTable(jobApplications)}
              </TabsContent>
              
              <TabsContent value="internships" className="mt-0">
                <h2 className="text-xl font-bold mb-4"><T>Internship Applicants</T></h2>
                {renderApplicantTable(internshipApplications)}
              </TabsContent>
              
              <TabsContent value="hackathons" className="mt-0">
                <h2 className="text-xl font-bold mb-4"><T>Hackathon Participants</T></h2>
                {renderApplicantTable(hackathonApplications)}
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default EmployerApplicants;
