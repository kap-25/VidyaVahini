import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LayoutDashboard, BookOpen, FileText, BarChart2, MessageSquare, File, GraduationCap } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
interface DashboardNavigationProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}
const DashboardNavigation: React.FC<DashboardNavigationProps> = ({
  activeTab,
  setActiveTab
}) => {
  const {
    translated: overviewLabel
  } = useTranslation("Overview");
  const {
    translated: coursesLabel
  } = useTranslation("Courses");
  const {
    translated: myCoursesLabel
  } = useTranslation("My Courses");
  const {
    translated: assignmentsLabel
  } = useTranslation("Assignments");
  const {
    translated: materialsLabel
  } = useTranslation("Materials");
  const {
    translated: discussionsLabel
  } = useTranslation("Discussions");
  const {
    translated: analyticsLabel
  } = useTranslation("Analytics");
  return <div className="overflow-hidden mb-6">
      <ScrollArea className="w-full" orientation="horizontal">
        <TabsList className="flex bg-edu-card-bg min-w-max">
          <TabsTrigger value="overview" className="flex flex-col items-center gap-1 py-3 min-w-[100px]">
            <LayoutDashboard size={18} />
            <span className="text-xs">{overviewLabel}</span>
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex flex-col items-center gap-1 py-3 min-w-[100px]">
            <BookOpen size={18} />
            <span className="text-xs">{coursesLabel}</span>
          </TabsTrigger>
          
          <TabsTrigger value="assignments" className="flex flex-col items-center gap-1 py-3 min-w-[100px]">
            <FileText size={18} />
            <span className="text-xs">{assignmentsLabel}</span>
          </TabsTrigger>
          <TabsTrigger value="materials" className="flex flex-col items-center gap-1 py-3 min-w-[100px]">
            <File size={18} />
            <span className="text-xs">{materialsLabel}</span>
          </TabsTrigger>
          <TabsTrigger value="discussions" className="flex flex-col items-center gap-1 py-3 min-w-[100px]">
            <MessageSquare size={18} />
            <span className="text-xs">{discussionsLabel}</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex flex-col items-center gap-1 py-3 min-w-[100px]">
            <BarChart2 size={18} />
            <span className="text-xs">{analyticsLabel}</span>
          </TabsTrigger>
        </TabsList>
      </ScrollArea>
    </div>;
};
export default DashboardNavigation;