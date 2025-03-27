
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Clock, BookOpen, FileText, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TranslatedText from '@/components/TranslatedText';
import { useLanguage } from '@/context/LanguageContext';

interface DashboardSummaryProps {
  recentCourses: Array<{
    id: string | number;
    title: string;
    progress: number;
    timeLeft: string;
  }>;
  upcomingAssignments: Array<{
    id: number;
    title: string;
    course: string;
    due: string;
  }>;
}

const DashboardSummary: React.FC<DashboardSummaryProps> = ({ 
  recentCourses, 
  upcomingAssignments 
}) => {
  const { translateBatch } = useLanguage();
  const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({
    dashboardOverview: "Dashboard Overview",
    viewFullDashboard: "View Full Dashboard",
    recentCourses: "Recent Courses",
    noCourses: "No courses in progress",
    remaining: "remaining",
    upcomingAssignments: "Upcoming Assignments",
    noAssignments: "No upcoming assignments",
    due: "Due"
  });
  
  // Preload all translations at once using batch translation
  useEffect(() => {
    const translateAllTexts = async () => {
      const keys = Object.keys(translatedTexts);
      const values = Object.values(translatedTexts);
      
      try {
        const translatedValues = await translateBatch(values);
        
        const newTranslatedTexts: Record<string, string> = {};
        keys.forEach((key, index) => {
          newTranslatedTexts[key] = translatedValues[index];
        });
        
        setTranslatedTexts(newTranslatedTexts);
      } catch (error) {
        console.error('Error translating dashboard texts:', error);
      }
    };
    
    translateAllTexts();
  }, [translateBatch]);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{translatedTexts.dashboardOverview}</h2>
        <Link to="/student-dashboard">
          <Button variant="outline" size="sm" className="text-edu-purple border-edu-purple hover:bg-edu-purple/10">
            {translatedTexts.viewFullDashboard}
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent Courses */}
        <Card className="bg-edu-card-bg border-edu-card-border">
          <CardContent className="p-4">
            <div className="flex items-center mb-4">
              <BookOpen className="w-5 h-5 mr-2 text-edu-purple" />
              <h3 className="font-semibold">{translatedTexts.recentCourses}</h3>
            </div>
            
            {recentCourses.length > 0 ? (
              <ul className="space-y-3">
                {recentCourses.slice(0, 2).map(course => (
                  <li key={course.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        <TranslatedText text={course.title} />
                      </p>
                      <div className="flex items-center text-xs text-gray-400 mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{course.timeLeft} {translatedTexts.remaining}</span>
                      </div>
                    </div>
                    <div className="text-xs font-medium bg-edu-purple/20 text-edu-purple py-1 px-2 rounded-full">
                      {course.progress}%
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">{translatedTexts.noCourses}</p>
            )}
          </CardContent>
        </Card>
        
        {/* Upcoming Assignments */}
        <Card className="bg-edu-card-bg border-edu-card-border">
          <CardContent className="p-4">
            <div className="flex items-center mb-4">
              <FileText className="w-5 h-5 mr-2 text-edu-purple" />
              <h3 className="font-semibold">{translatedTexts.upcomingAssignments}</h3>
            </div>
            
            {upcomingAssignments.length > 0 ? (
              <ul className="space-y-3">
                {upcomingAssignments.slice(0, 2).map(assignment => (
                  <li key={assignment.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        <TranslatedText text={assignment.title} />
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        <TranslatedText text={assignment.course} />
                      </p>
                    </div>
                    <div className="text-xs font-medium bg-amber-500/20 text-amber-500 py-1 px-2 rounded-full">
                      {translatedTexts.due} {assignment.due}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">{translatedTexts.noAssignments}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardSummary;
