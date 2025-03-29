
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import BottomNavigation from '@/components/BottomNavigation';
import { useAuth } from '@/context/AuthContext';
import VoiceAssistant from '@/components/VoiceAssistant';

// Import the refactored components
import DashboardHeader from '@/components/student/DashboardHeader';
import DashboardNavigation from '@/components/student/DashboardNavigation';
import DashboardOverview from '@/components/student/DashboardOverview';
import CoursesTab from '@/components/student/CoursesTab';
import AssignmentsTab from '@/components/student/AssignmentsTab';
import DiscussionsTab from '@/components/student/DiscussionsTab';
import AnalyticsTab from '@/components/student/AnalyticsTab';
import MaterialsTab from '@/components/student/MaterialsTab';
import MyCourses from '@/pages/MyCourses';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Mock data for current courses
  const currentCourses = [
    { id: 1, title: 'Advanced Mathematics', progress: 75, deadline: '2 days' },
    { id: 2, title: 'Physics Fundamentals', progress: 45, deadline: '5 days' },
    { id: 3, title: 'Web Development Basics', progress: 60, deadline: '3 days' },
  ];

  // Mock data for completed courses
  const completedCourses = [
    { id: 4, title: 'Introduction to Biology', completedDate: '2023-10-15' },
    { id: 5, title: 'Creative Writing', completedDate: '2023-09-22' },
  ];

  // Mock data for assignments
  const assignments = [
    { id: 1, title: 'Math Problem Set', course: 'Advanced Mathematics', due: '2023-11-05', status: 'pending' },
    { id: 2, title: 'Physics Lab Report', course: 'Physics Fundamentals', due: '2023-11-07', status: 'completed' },
    { id: 3, title: 'HTML/CSS Project', course: 'Web Development Basics', due: '2023-11-03', status: 'overdue' },
  ];

  // Mock data for discussions
  const discussions = [
    { id: 1, title: 'Need help with calculus problem 3.4', course: 'Advanced Mathematics', replies: 4, lastActive: '1 hour ago' },
    { id: 2, title: 'Study group for physics midterm?', course: 'Physics Fundamentals', replies: 7, lastActive: '3 hours ago' },
    { id: 3, title: 'Web dev project ideas sharing', course: 'Web Development Basics', replies: 12, lastActive: '1 day ago' },
  ];
  
  // Mock data for learning analytics
  const learningData = [
    { month: 'Jan', hours: 10 },
    { month: 'Feb', hours: 15 },
    { month: 'Mar', hours: 12 },
    { month: 'Apr', hours: 20 },
    { month: 'May', hours: 18 },
    { month: 'Jun', hours: 25 },
  ];
  
  const performanceData = [
    { subject: 'Mathematics', score: 85 },
    { subject: 'Physics', score: 72 },
    { subject: 'Web Dev', score: 90 },
    { subject: 'Biology', score: 65 },
  ];
  
  // Create global function to activate tabs from voice commands
  useEffect(() => {
    // Expose the tab activation function globally
    window.activateDashboardTab = (tabName: string) => {
      const validTabs = ["overview", "courses", "assignments", "materials", "discussions", "analytics", "my-courses"];
      if (validTabs.includes(tabName)) {
        setActiveTab(tabName);
        return true;
      }
      return false;
    };
    
    // Check for pending tab activation from combined voice commands
    const pendingTab = sessionStorage.getItem('pendingDashboardTab');
    if (pendingTab) {
      window.activateDashboardTab(pendingTab);
      sessionStorage.removeItem('pendingDashboardTab');
    }
    
    return () => {
      // Clean up on unmount
      delete window.activateDashboardTab;
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-edu-dark text-white pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <DashboardHeader 
          title="Student Dashboard" 
          description="Track your progress and manage your learning journey" 
        />
        
        {/* Navigation Menu */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <DashboardNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
          
          {/* Tab Contents */}
          <TabsContent value="overview">
            <DashboardOverview 
              currentCourses={currentCourses} 
              completedCourses={completedCourses} 
              notifications={[
                { id: 1, title: 'New lecture uploaded for Physics Fundamentals', time: '2 hours ago' },
                { id: 2, title: 'Reminder: Math assignment due tomorrow', time: '5 hours ago' },
                { id: 3, title: 'Web Development webinar this weekend', time: '1 day ago' },
              ]} 
            />
          </TabsContent>
          
          <TabsContent value="courses">
            <CoursesTab />
          </TabsContent>
          
          <TabsContent value="my-courses">
            <div className="p-4 bg-edu-card-bg rounded-lg">
              <MyCourses />
            </div>
          </TabsContent>
          
          <TabsContent value="assignments">
            <AssignmentsTab assignments={assignments} />
          </TabsContent>
          
          <TabsContent value="materials">
            <MaterialsTab />
          </TabsContent>
          
          <TabsContent value="discussions">
            <DiscussionsTab discussions={discussions} />
          </TabsContent>
          
          <TabsContent value="analytics">
            <AnalyticsTab 
              learningData={learningData} 
              performanceData={performanceData} 
            />
          </TabsContent>
        </Tabs>
      </div>
      <BottomNavigation />
      <VoiceAssistant />
    </div>
  );
};

export default StudentDashboard;
