import { FormEvent, useMemo, useState } from 'react';
import { Mail, Lock, Eye, MessageSquare, User } from 'lucide-react';
import { Screen } from '../navigation/routes';
import { useAuth } from '../auth/AuthContext';

export default function Login({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const primaryButtonLabel = useMemo(
    () => (isSubmitting ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'),
    [isSubmitting, mode],
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Username và password là bắt buộc.');
      return;
    }

    if (mode === 'register' && (!displayName.trim() || !email.trim())) {
      setErrorMessage('Display name và email là bắt buộc khi đăng ký.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login({ username: username.trim(), password });
      } else {
        await register({
          username: username.trim(),
          displayName: displayName.trim(),
          email: email.trim(),
          password,
        });
      }

      onNavigate('chat');
    } catch (error: unknown) {
      const fallback = mode === 'login' ? 'Đăng nhập thất bại.' : 'Đăng ký thất bại.';
      const message = error instanceof Error && error.message ? error.message : fallback;
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header Area */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/20 mb-4">
            <MessageSquare className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Pure Chat</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Connect with your world instantly</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
          {/* Toggle Switch */}
          <div className="p-6 pb-0">
            <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
              <button
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${mode === 'login' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                onClick={() => setMode('login')}
                type="button"
              >
                Login
              </button>
              <button
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${mode === 'register' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                onClick={() => setMode('register')}
                type="button"
              >
                Sign-up
              </button>
            </div>
          </div>

          {/* Form Content */}
          <form className="p-6 space-y-5" onSubmit={handleSubmit}>
            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" type="button">
                <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB46UED-49hSqrnOp6lUCgxyaCSmTyxITDuNl3YVjygrMmBAD6ljqmElKfScRyubtVeDuklfITguxrq627OkxzgaN4zlwMBOP2naAia4-cpWyXn5Xhxw0tJyfeaCh9-ONvvk8gflv5hjXmwf2GcP704CvMcC1NwPvswGywJeJlHiCNq0MY8zCwzRiiMhEnjuRb3ig-tyqthFHL3eDTgOp4jRAc5RlyysQminCbDjApurFES6nVloavYYvuKq9fYevClzXLw-JuU-Q" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" type="button">
                <span className="font-bold text-lg text-slate-700 dark:text-slate-300"></span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Apple</span>
              </button>
            </div>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
              <span className="flex-shrink mx-4 text-xs text-slate-400 uppercase tracking-widest font-bold">Or Email</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
            </div>

            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Display Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all"
                    placeholder="Your name"
                    type="text"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all"
                  placeholder="your_username"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </div>
            </div>

            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all"
                    placeholder="name@example.com"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                <a className="text-xs font-bold text-primary hover:underline" href="#">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors" type="button">
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>

            {errorMessage && (
              <p className="text-sm font-medium text-red-500">{errorMessage}</p>
            )}

            {/* Action Button */}
            <button
              disabled={isSubmitting}
              className="w-full py-4 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all transform active:scale-[0.98]"
              type="submit"
            >
              {primaryButtonLabel}
            </button>
          </form>

          {/* Footer */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                className="text-primary font-bold hover:underline"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                type="button"
              >
                {mode === 'login' ? 'Create one for free' : 'Sign in now'}
              </button>
            </p>
          </div>
        </div>

        {/* Privacy & Terms */}
        <div className="mt-8 flex justify-center gap-6 text-xs font-medium text-slate-400">
          <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
          <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
          <a className="hover:text-primary transition-colors" href="#">Help Center</a>
        </div>
      </div>
    </div>
  );
}
