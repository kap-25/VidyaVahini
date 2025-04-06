import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <div >      
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

export default App;
