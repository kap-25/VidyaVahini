
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

type UserRole = 'student' | 'teacher';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'signin';
  const isLogin = mode === 'signin';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the path the user was trying to access before being redirected to login
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    // If user is already authenticated, redirect them
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, { role });
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // This ensures that only valid roles can be set
    const selectedRole = e.target.value as UserRole;
    setRole(selectedRole);
  };

  return (
    <div className="min-h-screen bg-edu-dark flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-edu-card-bg rounded-xl p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">
          {isLogin ? 'Sign In' : 'Create Account'}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-edu-dark"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-edu-dark"
              required
            />
          </div>
          
          {!isLogin && (
            <div>
              <label htmlFor="role" className="block text-sm font-medium mb-1">
                I am a:
              </label>
              <select
                id="role"
                value={role}
                onChange={handleRoleChange}
                className="w-full rounded-md bg-edu-dark px-3 py-2 text-white"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full bg-edu-purple hover:bg-edu-purple-dark"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <Link
            to={isLogin ? '/auth?mode=signup' : '/auth?mode=signin'}
            className="text-edu-purple hover:underline text-sm"
          >
            {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;
