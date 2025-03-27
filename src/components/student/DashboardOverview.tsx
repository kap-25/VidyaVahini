
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Bell, FileText, BookOpen, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from '@/components/ui/progress';
import { Button } from "@/components/ui/button";

interface OverviewProps {
  currentCourses: any[];
  completedCourses: any[];
  notifications: any[];
}

const DashboardOverview: React.FC<OverviewProps> = ({ 
  currentCourses, 
  completedCourses, 
  notifications 
}) => {
  return (
    <div className="space-y-4">
      {/* Progress Overview Card */}
      <Card className="bg-edu-card-bg border-none">
        <CardHeader>
          <CardTitle>Learning Progress</CardTitle>
          <CardDescription className="text-gray-400">Your current learning status and upcoming tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-edu-dark/30 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Overall Progress</h3>
              <span className="text-sm font-bold">65%</span>
            </div>
            <Progress value={65} className="h-2 mb-3" />
            <div className="flex justify-between text-xs mt-2 text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                3 upcoming deadlines
              </span>
              <span className="flex items-center gap-1">
                <Bell size={12} />
                5 new notifications
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-edu-dark/30 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Current Courses</h3>
              <div className="text-3xl font-bold text-edu-purple-light">{currentCourses.length}</div>
              <p className="text-xs text-gray-400 mt-1">Active enrollments</p>
            </div>
            <div className="bg-edu-dark/30 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Completed</h3>
              <div className="text-3xl font-bold text-edu-purple-light">{completedCourses.length}</div>
              <p className="text-xs text-gray-400 mt-1">Finished courses</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Activity */}
      <Card className="bg-edu-card-bg border-none">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription className="text-gray-400">Your latest learning activities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-edu-dark/30 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="text-edu-purple" size={18} />
              <div>
                <h3 className="text-sm font-medium">Assignment Submitted</h3>
                <p className="text-xs text-gray-400">Physics Lab Report - 2 days ago</p>
              </div>
            </div>
          </div>
          <div className="p-3 bg-edu-dark/30 rounded-lg">
            <div className="flex items-center gap-3">
              <BookOpen className="text-edu-purple" size={18} />
              <div>
                <h3 className="text-sm font-medium">Lesson Completed</h3>
                <p className="text-xs text-gray-400">Web Development: CSS Basics - 3 days ago</p>
              </div>
            </div>
          </div>
          <div className="p-3 bg-edu-dark/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Award className="text-edu-purple" size={18} />
              <div>
                <h3 className="text-sm font-medium">Achievement Unlocked</h3>
                <p className="text-xs text-gray-400">Perfect Score: Mathematics Quiz - 1 week ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Notifications Summary */}
      <Card className="bg-edu-card-bg border-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Latest Notifications</CardTitle>
            <CardDescription className="text-gray-400">Recent updates from your courses</CardDescription>
          </div>
          <Link to="/notifications">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.slice(0, 2).map(notification => (
            <div key={notification.id} className="p-3 bg-edu-dark/30 rounded-lg">
              <h3 className="text-sm font-medium">{notification.title}</h3>
              <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
