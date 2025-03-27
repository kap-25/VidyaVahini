import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/context/AuthContext';
import BottomNavigation from '@/components/BottomNavigation';

// Import dashboard components
import DashboardHeader from '@/components/student/DashboardHeader';
import DashboardNavigation from '@/components/student/DashboardNavigation';

// Define interface for window with our custom function - removing from here
// as it's already defined in vite-env.d.ts

const EducatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Create global function to activate tabs from voice commands
  useEffect(() => {
    // Expose the tab activation function globally
    window.activateDashboardTab = (tabName: string) => {
      const validTabs = ["overview", "courses", "students", "materials", "discussions", "analytics"];
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
          title="Educator Dashboard" 
          description="Manage your courses and monitor student progress" 
        />
        
        {/* Navigation Menu */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid grid-cols-6 bg-edu-card-bg mb-6">
            <TabsTrigger value="overview" className="flex flex-col items-center gap-1 py-3">
              <LayoutDashboard size={18} />
              <span className="text-xs">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex flex-col items-center gap-1 py-3">
              <BookOpen size={18} />
              <span className="text-xs">Courses</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex flex-col items-center gap-1 py-3">
              <Users size={18} />
              <span className="text-xs">Students</span>
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex flex-col items-center gap-1 py-3">
              <File size={18} />
              <span className="text-xs">Materials</span>
            </TabsTrigger>
            <TabsTrigger value="discussions" className="flex flex-col items-center gap-1 py-3">
              <MessageSquare size={18} />
              <span className="text-xs">Discussions</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex flex-col items-center gap-1 py-3">
              <BarChart2 size={18} />
              <span className="text-xs">Analytics</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Tab Contents */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-edu-card-bg border-none">
                <CardHeader>
                  <CardTitle>Course Overview</CardTitle>
                  <CardDescription className="text-muted-foreground">Performance metrics for your courses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Advanced Mathematics</span>
                      <span className="text-edu-purple">28 students</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Physics Fundamentals</span>
                      <span className="text-edu-purple">17 students</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-edu-card-bg border-none">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription className="text-muted-foreground">Latest updates from your courses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <p className="font-medium">5 new assignment submissions</p>
                      <p className="text-muted-foreground">Physics Fundamentals</p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">New discussion thread</p>
                      <p className="text-muted-foreground">Advanced Mathematics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="courses">
            <Card className="bg-edu-card-bg border-none">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Your Courses</CardTitle>
                  <CardDescription className="text-muted-foreground">Manage and create courses</CardDescription>
                </div>
                <Button className="bg-edu-purple hover:bg-edu-purple-dark">Create Course</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-edu-dark/30 rounded-lg">
                    <h3 className="font-medium">Advanced Mathematics</h3>
                    <p className="text-xs text-gray-400">28 students enrolled</p>
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline">Content</Button>
                      <Button size="sm" variant="outline">Learn</Button>
                    </div>
                  </div>
                  <div className="p-4 bg-edu-dark/30 rounded-lg">
                    <h3 className="font-medium">Physics Fundamentals</h3>
                    <p className="text-xs text-gray-400">17 students enrolled</p>
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline">Content</Button>
                      <Button size="sm" variant="outline">Learn</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="students">
            <Card className="bg-edu-card-bg border-none">
              <CardHeader>
                <CardTitle>Student Management</CardTitle>
                <CardDescription className="text-muted-foreground">Track student performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-edu-dark/30 rounded-lg">
                    <h3 className="font-medium">John Smith</h3>
                    <p className="text-xs text-gray-400">Enrolled in 2 courses</p>
                    <div className="mt-2">
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </div>
                  <div className="p-4 bg-edu-dark/30 rounded-lg">
                    <h3 className="font-medium">Emma Johnson</h3>
                    <p className="text-xs text-gray-400">Enrolled in 3 courses</p>
                    <div className="mt-2">
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="materials">
            <Card className="bg-edu-card-bg border-none">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Teaching Materials</CardTitle>
                  <CardDescription className="text-muted-foreground">Manage your educational content</CardDescription>
                </div>
                <Button className="bg-edu-purple hover:bg-edu-purple-dark">Upload</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-edu-dark/30 rounded-lg">
                    <h3 className="font-medium">Calculus Lecture Slides</h3>
                    <p className="text-xs text-gray-400">Advanced Mathematics</p>
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" variant="outline">Download</Button>
                      <Button size="sm" variant="outline">Edit</Button>
                    </div>
                  </div>
                  <div className="p-4 bg-edu-dark/30 rounded-lg">
                    <h3 className="font-medium">Physics Lab Instructions</h3>
                    <p className="text-xs text-gray-400">Physics Fundamentals</p>
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" variant="outline">Download</Button>
                      <Button size="sm" variant="outline">Edit</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="discussions">
            <Card className="bg-edu-card-bg border-none">
              <CardHeader>
                <CardTitle>Class Discussions</CardTitle>
                <CardDescription className="text-muted-foreground">Manage student conversations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-edu-dark/30 rounded-lg">
                    <h3 className="font-medium">Calculus Problem Help</h3>
                    <p className="text-xs text-gray-400">Advanced Mathematics • 8 replies</p>
                    <div className="mt-2">
                      <Button size="sm" variant="outline">View Thread</Button>
                    </div>
                  </div>
                  <div className="p-4 bg-edu-dark/30 rounded-lg">
                    <h3 className="font-medium">Physics Project Collaboration</h3>
                    <p className="text-xs text-gray-400">Physics Fundamentals • 12 replies</p>
                    <div className="mt-2">
                      <Button size="sm" variant="outline">View Thread</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card className="bg-edu-card-bg border-none">
              <CardHeader>
                <CardTitle>Teaching Analytics</CardTitle>
                <CardDescription className="text-muted-foreground">Performance metrics and insights</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="text-center">Analytics visualization will be displayed here</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default EducatorDashboard;

// Required imports for the component
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, BookOpen, Users, File, MessageSquare, BarChart2 } from 'lucide-react';
