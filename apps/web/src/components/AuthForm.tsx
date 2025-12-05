import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Card } from './ui';

interface AuthFormProps {
  mode: 'signin' | 'signup';
}

const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Auto-redirect if already logged in
  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    const state = location.state as any;
    const from = typeof state?.from === 'string' ? state.from : undefined;

    let defaultTarget = '/dashboard';

    const redirectTo = from || defaultTarget;
    navigate(redirectTo, { replace: true });
  }, [user, authLoading, location, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let result;
      if (mode === 'signin') {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password, fullName);
      }

      if (result.error) {
        setMessage(result.error.message);
      } else {
        if (mode === 'signup') {
          setMessage('Check your email for the confirmation link!');
        } else {
          // Successful login - redirect to intended destination or appropriate home
          const state = location.state as any;
          const from = typeof state?.from === 'string' ? state.from : undefined;

          let defaultTarget = '/dashboard';

          const redirectTo = from || defaultTarget;
          navigate(redirectTo, { replace: true });
        }
      }
    } catch (error) {
      setMessage('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card className="p-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white">
              {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
            </h2>
            <p className="mt-2 text-gray-300">
              {mode === 'signin'
                ? "Don't have an account? "
                : "Already have an account? "}
              <Link
                to={mode === 'signin' ? '/register' : '/login'}
                className="font-medium text-indigo-400 hover:text-indigo-300"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </Link>
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-0">
              {mode === 'signup' && (
                <div>
                  <label htmlFor="full-name" className="sr-only">
                    Full Name
                  </label>
                  <input
                    id="full-name"
                    name="fullName"
                    type="text"
                    required
                    className="input rounded-b-none"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              )}
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`input ${mode === 'signup' ? 'rounded-t-none rounded-b-none' : 'rounded-b-none'}`}
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={`input ${mode === 'signup' ? 'rounded-t-none' : 'rounded-t-none'}`}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {message && (
              <div className={`text-center text-sm ${
                message.includes('Check your email') ? 'text-green-400' : 'text-red-400'
              }`}>
                {message}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Please wait...' : (mode === 'signin' ? 'Sign in' : 'Sign up')}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AuthForm;
