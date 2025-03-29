
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AssignmentsTabProps {
  assignments: any[];
}

const AssignmentsTab: React.FC<AssignmentsTabProps> = ({ assignments }) => {
  return (
    <div className="space-y-4">
      <Card className="bg-edu-card-bg border-none">
        <CardHeader className="flex flex-row-2 items-center justify-between">
          <div>
            <CardTitle>Assignments & Quizzes</CardTitle>
            <CardDescription className="text-gray-400">Track your academic tasks</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Filter</Button>
            <Button variant="outline" size="sm">Sort</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assignments.map(assignment => (
              <div 
                key={assignment.id} 
                className={`p-4 bg-edu-dark/30 rounded-lg border-l-4 ${
                  assignment.status === 'overdue' ? 'border-l-red-500' : 
                  assignment.status === 'completed' ? 'border-l-green-500' : 
                  'border-l-yellow-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{assignment.title}</h3>
                    <p className="text-xs text-gray-400">{assignment.course}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      assignment.status === 'overdue' ? 'bg-red-500/20 text-red-300' : 
                      assignment.status === 'completed' ? 'bg-green-500/20 text-green-300' : 
                      'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {assignment.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">Due: {assignment.due}</p>
                  </div>
                </div>
                {assignment.status !== 'completed' && (
                  <div className="mt-4 flex gap-1 justify-end">
                    <Button size="sm" variant="outline" className='w-22 h-10'>
                      View Details
                    </Button>
                    {assignment.status === 'pending' && (
                      <Button size="sm" variant="default" className="bg-edu-purple w-20 hover:bg-edu-purple-light">
                        Start Work
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-edu-card-bg border-none">
        <CardHeader>
          <CardTitle>Upcoming Tests & Exams</CardTitle>
          <CardDescription className="text-gray-400">Prepare for your evaluations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 bg-edu-dark/30 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">Mathematics Mid-Term</h3>
                  <p className="text-xs text-gray-400">Advanced Mathematics</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                    In 5 days
                  </span>
                  <p className="text-xs text-gray-400 mt-1">30 minutes duration</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-edu-dark/30 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">Physics Quiz</h3>
                  <p className="text-xs text-gray-400">Physics Fundamentals</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                    In 2 weeks
                  </span>
                  <p className="text-xs text-gray-400 mt-1">15 minutes duration</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentsTab;
