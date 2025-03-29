
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from '@/components/ui/progress';
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

interface AnalyticsTabProps {
  learningData: any[];
  performanceData: any[];
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  learningData,
  performanceData
}) => {
  return (
    <div className="space-y-4">
      <Card className="bg-edu-card-bg border-none">
        <CardHeader>
          <CardTitle>Learning Analytics</CardTitle>
          <CardDescription className="text-gray-400">Track your performance and study patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-edu-dark/30 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-4">Study Hours Per Month</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={learningData}>
                    <XAxis dataKey="month" stroke="#9b87f5" />
                    <YAxis stroke="#9b87f5" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1A1F2C', border: 'none' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="hours" fill="#9b87f5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-edu-dark/30 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-4">Performance By Subject</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="subject" stroke="#9b87f5" />
                    <YAxis stroke="#9b87f5" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1A1F2C', border: 'none' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="score" stroke="#9b87f5" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 bg-edu-dark/30 p-2 rounded-lg">
            <div className="text-center p-3 border-2 rounded">
              <p className="text-gray-400 text-sm">Total Study Hours</p>
              <p className="text-2xl font-bold text-edu-purple">87</p>
            </div>
            <div className="text-center p-3 border-2 rounded">
              <p className="text-gray-400 text-sm">Completed Tasks</p>
              <p className="text-2xl font-bold text-edu-purple">24</p>
            </div>
            <div className="text-center p-3 border-2 rounded">
              <p className="text-gray-400 text-sm">Average Score</p>
              <p className="text-2xl font-bold text-edu-purple">78%</p>
            </div>
            <div className="text-center p-3 border-2 rounded">
              <p className="text-gray-400 text-sm">Streak</p>
              <p className="text-2xl font-bold text-edu-purple">12</p>
            </div>
          </div>

        </CardContent>
      </Card>

      <Card className="bg-edu-card-bg border-none">
        <CardHeader>
          <CardTitle>Learning Insights</CardTitle>
          <CardDescription className="text-gray-400">Personalized feedback on your learning style</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-edu-dark/30 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Study Time Distribution</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Morning</span>
                  <span>20%</span>
                </div>
                <Progress value={20} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Afternoon</span>
                  <span>45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Evening</span>
                  <span>35%</span>
                </div>
                <Progress value={35} className="h-2" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-edu-dark/30 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Productivity Insights</h3>
            <p className="text-sm text-gray-200">
              You seem to be most productive during afternoon hours. Consider scheduling complex tasks during this time for optimal performance.
            </p>
            <Button variant="outline" size="sm" className="mt-3">
              View Detailed Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTab;
