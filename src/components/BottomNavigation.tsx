
import React from 'react';
import { Home, Search, BookOpen, User, GraduationCap, LayoutDashboard, Bot, Briefcase, Bell, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import TranslateButton from './TranslateButton';

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const isTeacher = user?.user_metadata?.role === 'teacher';
  const isStudent = !isTeacher && user?.user_metadata?.role === 'student';
  const isEmployer = user?.user_metadata?.role === 'employer';
  
  // Define navigation items based on user role
  let navItems = [];
  
  if (isEmployer) {
    // Employer-specific navigation - simplified to only relevant options
    navItems = [
      { icon: <Home size={22} />, label: 'Home', path: '/' },
      { icon: <Briefcase size={22} />, label: 'Jobs', path: '/employer-jobs' },
      { icon: <Users size={22} />, label: 'Applicants', path: '/employer-applicants' },
      { icon: <Bell size={22} />, label: 'Notifications', path: '/employer-notifications' },
      { icon: <User size={22} />, label: 'Profile', path: '/employer-profile' },
    ];
  } else if (isTeacher) {
    // Teacher-specific navigation
    navItems = [
      { icon: <Home size={22} />, label: 'Home', path: '/' },
      { icon: <Search size={22} />, label: 'Explore', path: '/explore' },
      { icon: <BookOpen size={22} />, label: 'Courses', path: '/courses' },
      { icon: <Bot size={22} />, label: 'AI Tutor', path: '/edu-chat' },
      { icon: <GraduationCap size={22} />, label: 'My Courses', path: '/my-courses' },
      { icon: <User size={22} />, label: 'Profile', path: '/educator-profile' },
    ];
  } else if (isStudent) {
    // Student-specific navigation
    navItems = [
      { icon: <Home size={22} />, label: 'Home', path: '/' },
      { icon: <Search size={22} />, label: 'Explore', path: '/explore' },
      { icon: <BookOpen size={22} />, label: 'Courses', path: '/courses' },
      { icon: <Bot size={22} />, label: 'AI Tutor', path: '/edu-chat' },
      { icon: <Briefcase size={22} />, label: 'Jobs', path: '/jobs' },
      { icon: <LayoutDashboard size={22} />, label: 'Dashboard', path: '/student-dashboard' },
      { icon: <User size={22} />, label: 'Profile', path: '/student-profile' },
    ];
  } else {
    // Default navigation for unauthenticated users
    navItems = [
      { icon: <Home size={22} />, label: 'Home', path: '/' },
      { icon: <Search size={22} />, label: 'Explore', path: '/explore' },
      { icon: <BookOpen size={22} />, label: 'Courses', path: '/courses' },
      { icon: <Bot size={22} />, label: 'AI Tutor', path: '/edu-chat' },
      { icon: <Briefcase size={22} />, label: 'Jobs', path: '/jobs' },
      { icon: <User size={22} />, label: 'Profile', path: '/profile' },
    ];
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-edu-dark border-t border-muted pt-2 pb-6 px-1 z-10">
      <div className="grid grid-flow-col auto-cols-fr gap-1 max-w-md mx-auto">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path || 
                          (item.path === '/courses' && location.pathname.startsWith('/courses')) ||
                          (item.path === '/jobs' && location.pathname.startsWith('/jobs'));
          
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex flex-col items-center justify-center px-1 py-1 rounded-lg transition-colors ${
                isActive ? 'text-edu-purple bg-edu-dark/50' : 'text-muted-foreground hover:text-edu-purple hover:bg-edu-dark/30'
              }`}
            >
              <div className="mb-1">{item.icon}</div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
        
        {!isEmployer && (
          <div className="flex flex-col items-center justify-center px-1 py-1">
            <TranslateButton variant="ghost" size="icon" className="mb-1 text-muted-foreground hover:text-edu-purple" />
            <span className="text-xs font-medium text-muted-foreground">Language</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BottomNavigation;
