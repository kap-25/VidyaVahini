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
  return (
    <div className="mb-6 h-full bg-edu-card-bg">
      <TabsList className="grid grid-cols-3 h-full gap-2">
        {/* Row 1 */}
        <TabsTrigger value="overview" className="flex flex-col items-center gap-1 py-3">
          <LayoutDashboard size={18} />
          <span className="text-xs">{overviewLabel}</span>
        </TabsTrigger>
        <TabsTrigger value="courses" className="flex flex-col items-center gap-1 py-3">
          <BookOpen size={18} />
          <span className="text-xs">{coursesLabel}</span>
        </TabsTrigger>
        <TabsTrigger value="assignments" className="flex flex-col items-center gap-1 py-3">
          <FileText size={18} />
          <span className="text-xs">{assignmentsLabel}</span>
        </TabsTrigger>
  
        {/* Row 2 */}
        <TabsTrigger value="materials" className="flex flex-col items-center gap-1 py-3">
          <File size={18} />
          <span className="text-xs">{materialsLabel}</span>
        </TabsTrigger>
        <TabsTrigger value="discussions" className="flex flex-col items-center gap-1 py-3">
          <MessageSquare size={18} />
          <span className="text-xs">{discussionsLabel}</span>
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex flex-col items-center gap-1 py-3">
          <BarChart2 size={18} />
          <span className="text-xs">{analyticsLabel}</span>
        </TabsTrigger>
      </TabsList>
    </div>
  )
};
export default DashboardNavigation;
