import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { FaCaretDown } from 'react-icons/fa';
import CourseLearn from '@/pages/CourseLearn';
import CourseLearnEdit from '@/pages/CourseLearnEdit';
import CourseDetails from '@/pages/CourseDetails';
import CourseCatalog from '@/pages/CourseCatalog';
import CourseContentEditor from '@/components/educator/CourseContentEditor';
import MyCourses from '@/pages/MyCourses';
import PrivateRoute from '@/components/PrivateRoute';
import Explore from '@/pages/Explore';
import NotFound from '@/pages/NotFound';
import Auth from '@/pages/Auth';
import StudentDashboard from '@/pages/StudentDashboard';
import EducatorDashboard from '@/pages/EducatorDashboard';
import StudentProfile from '@/pages/StudentProfile';
import EducatorProfile from '@/pages/EducatorProfile';
import EmployerProfile from '@/pages/EmployerProfile';
import StudentIndex from '@/pages/StudentIndex';
import EducatorIndex from '@/pages/EducatorIndex';
import EmployerIndex from '@/pages/EmployerIndex';
import MainIndex from '@/pages/MainIndex';
import EducationalChatbot from '@/pages/EducationalChatbot';
import JobsPage from '@/pages/JobsPage';
import EmployerNotifications from '@/pages/EmployerNotifications';
import EmployerApplicants from '@/pages/EmployerApplicants';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Toaster } from './components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import Index from './pages/Index';
import VoiceAssistant from './components/VoiceAssistant';
import AiChatBox from './components/AiChatBox';
import TranslationWrapper from './components/TranslationWrapper';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import '@/styles/themes.css';
import './styles/globals.css';

function AppContent() {
  const { theme, onThemeChange } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const themes = [
    { name: 'Light', value: 'light' },
    { name: 'Dark', value: 'dark' },
    { name: 'Blue', value: 'blue' },
    { name: 'Red', value: 'red' },
    { name: 'Orange', value: 'orange' },
    { name: 'Purple', value: 'purple' },
  ];

  return (
    <div className={`${theme} min-h-screen transition-colors duration-200`}>
      <div className={`theme-controls fixed top-4 right-4 z-50 p-3 rounded-lg backdrop-blur-sm ${
        theme === 'dark' ? 'bg-gray-800/90' : 'bg-white/90'
      } shadow-lg border border-gray-200 dark:border-gray-700`}>
        <div className="relative">
          <button
            className="px-4 py-2 rounded-md transition-all duration-200 font-medium flex items-center gap-2 bg-gray-200 dark:bg-gray-700"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            Select Theme <FaCaretDown />
          </button>
          {dropdownOpen && (
            <ul className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden">
              {themes.map((t) => (
                <li
                  key={t.value}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    theme === t.value ? 'font-bold' : ''
                  }`}
                  onClick={() => {
                    onThemeChange(t.value);
                    setDropdownOpen(false);
                  }}
                >
                  {t.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <Router>
        <AuthProvider>
          <LanguageProvider>
            <TranslationWrapper>
              <Routes>
                {/* Common Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/main" element={<MainIndex />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="*" element={<NotFound />} />
              
              
                {/* Student & Educator Routes */}
                <Route path="/courses" element={<CourseCatalog />} />
                <Route path="/courses/:id" element={<CourseDetails />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/edu-chat" element={<EducationalChatbot />} />
                <Route path="/student-dashboard" element={<PrivateRoute><StudentDashboard /></PrivateRoute>} />
                <Route path="/educator-dashboard" element={<PrivateRoute><EducatorDashboard /></PrivateRoute>} />
                <Route path="/student-profile" element={<PrivateRoute><StudentProfile /></PrivateRoute>} />
                <Route path="/educator-profile" element={<PrivateRoute><EducatorProfile /></PrivateRoute>} />
                <Route path="/my-courses" element={<PrivateRoute><MyCourses /></PrivateRoute>} />
                <Route path="/student" element={<PrivateRoute><StudentIndex /></PrivateRoute>} />
                <Route path="/educator" element={<PrivateRoute><EducatorIndex /></PrivateRoute>} />
                <Route path="/courses/:id/learn" element={<PrivateRoute><CourseLearn /></PrivateRoute>} />
                <Route path="/courses/:id/edit-content" element={<PrivateRoute><CourseContentEditor /></PrivateRoute>} />
                <Route path="/courses/:id/edit" element={<PrivateRoute><CourseContentEditor /></PrivateRoute>} />
                <Route path="/courses/:id/edit-learn" element={<PrivateRoute><CourseLearnEdit /></PrivateRoute>} />
                
                {/* Job Routes (accessible by students and employers) */}
                <Route path="/jobs" element={<JobsPage />} />
                
                {/* Employer-specific Routes */}
                <Route path="/employer" element={<PrivateRoute><EmployerIndex /></PrivateRoute>} />
                <Route path="/employer-jobs" element={<PrivateRoute><JobsPage /></PrivateRoute>} />
                <Route path="/employer-notifications" element={<PrivateRoute><EmployerNotifications /></PrivateRoute>} />
                <Route path="/employer-profile" element={<PrivateRoute><EmployerProfile /></PrivateRoute>} />
                <Route path="/employer-applicants" element={<PrivateRoute><EmployerApplicants /></PrivateRoute>} />
              </Routes>
              
              <Toaster />
              <SonnerToaster position="top-right" expand={true} richColors />
              <VoiceAssistant />
              <AiChatBox />
            </TranslationWrapper>
          </LanguageProvider>
        </AuthProvider>
      </Router>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
