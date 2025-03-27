
import React from 'react';
import { Home, Search, BookOpen, User, GraduationCap, LayoutDashboard, Bot } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import TranslateButton from './TranslateButton';

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const isTeacher = user?.user_metadata?.role === 'teacher';
  const isStudent = !isTeacher && user?.user_metadata?.role === 'student';
  
  const navItems = [
    { icon: <Home size={22} />, label: 'Home', path: '/' },
    { icon: <Search size={22} />, label: 'Explore', path: '/explore' },
    { icon: <BookOpen size={22} />, label: 'Courses', path: '/courses' },
    { icon: <Bot size={22} />, label: 'AI Tutor', path: '/edu-chat' },
    ...(isTeacher ? [{ icon: <GraduationCap size={22} />, label: 'My Courses', path: '/my-courses' }] : []),
    ...(isStudent ? [{ icon: <LayoutDashboard size={22} />, label: 'Dashboard', path: '/student-dashboard' }] : []),
    { icon: <User size={22} />, label: 'Profile', path: isStudent ? '/student-profile' : isTeacher ? '/educator-profile' : '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-edu-dark border-t border-muted pt-2 pb-6 px-4">
      <div className="flex justify-between max-w-md mx-auto">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path || 
                          (item.path === '/courses' && location.pathname.startsWith('/courses'));
          
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex flex-col items-center ${
                isActive ? 'text-edu-purple' : 'text-muted-foreground hover:text-edu-purple'
              }`}
            >
              <div className="mb-1">{item.icon}</div>
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
        
        <div className="flex flex-col items-center">
          <TranslateButton variant="ghost" size="icon" className="mb-1 text-muted-foreground hover:text-edu-purple" />
          <span className="text-xs text-muted-foreground">Language</span>
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;
