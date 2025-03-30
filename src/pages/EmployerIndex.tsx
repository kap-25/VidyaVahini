
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Users, Bell, Building } from 'lucide-react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import T from '@/components/T';
import DashboardHeader from '@/components/student/DashboardHeader';

const EmployerIndex = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-edu-dark text-white pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <DashboardHeader
          title="Employer Dashboard"
          description="Manage your job postings and applicants"
        />
        <div className="max-w-4xl mx-auto px-4 py-8">
          

          <div className="grid grid-cols-2 gap-2 mb-8">
            <Card className="bg-edu-card-bg border-edu-card-border text-white hover:border-edu-purple transition-colors">
              <CardContent className="p-6">
                <Button
                  variant="link"
                  className="w-full h-full flex flex-col items-center justify-center gap-4 p-0 text-white"
                  onClick={() => navigate('/employer-jobs')}
                >
                  <Briefcase className="h-12 w-12 text-edu-purple" />
                  <span className="text-lg font-small"><T>Job Postings</T></span>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-edu-card-bg border-edu-card-border text-white hover:border-edu-purple transition-colors">
              <CardContent className="p-6">
                <Button
                  variant="link"
                  className="w-full h-full flex flex-col items-center justify-center gap-3 p-0 text-white"
                  onClick={() => navigate('/employer-applicants')}
                >
                  <Users className="h-12 w-12 text-edu-purple" />
                  <span className="text-lg font-small"><T>Applicants</T></span>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-edu-card-bg border-edu-card-border text-white hover:border-edu-purple transition-colors">
              <CardContent className="p-6">
                <Button
                  variant="link"
                  className="w-full h-full flex flex-col items-center justify-center gap-3 p-0 text-white"
                  onClick={() => navigate('/employer-notifications')}
                >
                  <Bell className="h-12 w-12 text-edu-purple" />
                  <span className="text-lg font-small"><T>Notifications</T></span>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-edu-card-bg border-edu-card-border text-white hover:border-edu-purple transition-colors">
              <CardContent className="p-6">
                <Button
                  variant="link"
                  className="w-full h-full flex flex-col items-center justify-center gap-3 p-0 text-white"
                  onClick={() => navigate('/employer-profile')}
                >
                  <Building className="h-12 w-12 text-edu-purple" />
                  <span className="text-lg font-small"><T>Profile</T></span>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-edu-card-bg border-edu-card-border text-white mb-6">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4"><T>Quick Actions</T></h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-edu-card-border hover:bg-edu-purple/20"
                  onClick={() => navigate('/jobs')}
                >
                  <Briefcase className="mr-2 h-4 w-4 text-edu-purple" />
                  <T>Post New Job</T>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start border-edu-card-border hover:bg-edu-purple/20"
                  onClick={() => navigate('/employer-applicants')}
                >
                  <Users className="mr-2 h-4 w-4 text-edu-purple" />
                  <T>Recent Applicants</T>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <BottomNavigation />
      </div>
    </div>
  );
};

export default EmployerIndex;
