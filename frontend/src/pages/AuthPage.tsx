import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Chrome, ChevronLeft, Zap, Facebook } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE;

const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  // Default to 'welcome' view unless redirected
  const [view, setView] = useState<'welcome' | 'login' | 'signup'>('welcome');
  
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
       setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`${API_BASE}/auth/login`, { email, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      const msg = err.response?.data?.error || err.message || 'Login failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.post(`${API_BASE}/auth/register`, { email, password, confirmPassword });
      // Auto switch to login with success message
      setView('login');
      setSuccess('Account created! Please log in with your credentials.');
      setError(''); // Clear error if any
      // Optional: Pre-fill email
    } catch (err: any) {
      console.error('Signup error:', err);
      const msg = err.response?.data?.error || err.message || 'Registration failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const { data } = await axios.post(`${API_BASE}/auth/google-login`, { 
          idToken: tokenResponse.access_token 
        });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        navigate('/');
      } catch (err) {
        console.error("Google verify error", err);
        setError('Google authentication failed.');
      }
    },
    onError: () => setError('Google Authentication Failed'),
  });

  const isWelcome = view === 'welcome';
  const isLogin = view === 'login';

  // Responsive check
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [stats, setStats] = useState({
    uptime: '99.99%',
    operations: '0',
    encryption: '256-bit'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/auth/stats`);
        // Format operations with K/M suffix
        const formatNumber = (num: number) => {
           if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M+';
           if (num >= 1000) return (num / 1000).toFixed(1) + 'K+';
           return num.toString();
        };
        setStats({
          uptime: data.uptime,
          operations: formatNumber(data.operations),
          encryption: data.encryption
        });
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] flex font-sans selection:bg-indigo-500/30 overflow-x-hidden overflow-y-auto relative">
      {/* 
        PREMIUM DYNAMIC BACKGROUND 
      */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
        <div className="absolute top-[40%] left-[40%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      {/* 
        THE LID / POCKET PANEL 
        - Desktop: Slides LEFT (Width 100% -> 45%)
        - Mobile: Slides UP (Height 100% -> ~250px)
      */}
      <motion.div 
        initial={false}
        animate={{ 
          width: isDesktop ? (isWelcome ? '100%' : '45%') : '100%',
          height: isDesktop ? '100%' : (isWelcome ? '100dvh' : '280px'), // 100dvh covers mobile address bar issues
          borderTopRightRadius: isDesktop ? (isWelcome ? '0px' : '150px') : '0px',
          borderBottomRightRadius: isDesktop ? (isWelcome ? '0px' : '150px') : (isWelcome ? '0px' : '60px'),
          borderBottomLeftRadius: isDesktop ? '0px' : (isWelcome ? '0px' : '60px'),
        }}
        transition={{ type: "spring", stiffness: 90, damping: 14, mass: 0.8 }}
        className="fixed left-0 top-0 z-30 bg-slate-900/40 backdrop-blur-xl border-r border-white/5 shadow-[20px_0_50px_rgba(0,0,0,0.5)] overflow-hidden" 
        style={{ willChange: 'width, height, border-radius' }}
      >
        {/* Glowing Edge Border */}
        {!isWelcome && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`absolute bg-gradient-to-b from-transparent via-indigo-400 to-transparent opacity-70 shadow-[0_0_20px_rgba(99,102,241,0.8)]
              ${isDesktop ? 'right-0 top-0 bottom-0 w-[1px] h-full' : 'bottom-0 left-0 right-0 h-[1px] w-full bg-gradient-to-r'}
            `}
          />
        )}

        {/* 
          INNER CONTENT CONTAINER
        */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Inner Gradient for depth */}
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/80 via-transparent to-slate-950/80 pointer-events-none"></div>

            <motion.div 
              layout 
              className={`relative z-20 flex flex-col items-start text-left px-8 sm:px-12 max-w-[640px] w-full transition-all duration-500
                 ${isWelcome ? 'scale-100' : 'scale-75 origin-top-left mt-8 lg:mt-0 lg:scale-90 items-center text-center'} 
              `} 
            >
              <AnimatePresence mode="wait">
                {isWelcome ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col items-start"
                  >
                     <div className="mb-6 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md">
                        <span className="text-[10px] font-bold tracking-[0.2em] text-indigo-300 uppercase">Enterprise Platform</span>
                     </div>
                     
                     <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-[1.05]">
                        Build the <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-gradient-x">Future</span>
                     </h1>
                     
                     <p className="text-slate-300/80 text-lg md:text-xl leading-relaxed mb-10 font-light max-w-lg">
                        The premier platform for enterprise intelligence. Secure, scalable, and built for precision.
                     </p>

                     <div className="flex flex-wrap gap-4 mb-16">
                        <button 
                          onClick={() => setView('login')}
                          className="group relative px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                          <span className="relative z-10">Launch Console</span>
                          <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                        </button>
                        
                        <button 
                          onClick={() => setView('signup')}
                          className="group px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-white font-bold rounded-xl border border-white/10 backdrop-blur-md transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                          <span>Create Access</span>
                          <Zap className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
                        </button>
                     </div>

                     <div className="grid grid-cols-3 gap-8 w-full border-t border-white/10 pt-8">
                        <div>
                           <h4 className="text-2xl md:text-3xl font-black text-white mb-1">{stats.uptime}</h4>
                           <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Uptime SLA</p>
                        </div>
                        <div>
                           <h4 className="text-2xl md:text-3xl font-black text-white mb-1">{stats.operations}</h4>
                           <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Operations Daily</p>
                        </div>
                        <div>
                           <h4 className="text-2xl md:text-3xl font-black text-white mb-1">{stats.encryption}</h4>
                           <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Encryption</p>
                        </div>
                     </div>
                  </motion.div>
                ) : (
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className="flex flex-col items-center"
                     key="logo-title"
                  >
                     <motion.div layoutId="logo-container" className="mb-6 relative group cursor-pointer mix-blend-screen">
                        <div className="absolute inset-0 bg-indigo-500/30 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <img src="/logo.jpg" alt="Nexus Logo" className="w-[180px] h-[180px] object-contain relative transition-transform duration-500 group-hover:scale-105 opacity-90 mix-blend-screen" />
                    </motion.div>
                    <motion.h1 layoutId="title" className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Nexus</span>
                    </motion.h1>
                    <motion.p layoutId="desc" className="text-slate-400 text-sm font-medium uppercase tracking-widest">
                      Enterprise Access
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
        </div>
      </motion.div>

      {/* 
        RIGHT SIDE: THE "INSIDE" POCKET CONTENT
      */}
      <motion.div 
        animate={{ 
          paddingTop: isDesktop ? '0px' : (isWelcome ? '0px' : '300px'), // Push content down on mobile
          paddingLeft: isDesktop ? (isWelcome ? '0%' : '45%') : '0px'     // Push content right on desktop
        }} 
        className={`
          w-full flex-1 flex items-start lg:items-center justify-center p-6 z-20 min-h-[600px]
          ${isWelcome && 'hidden'} // Completely hide content when welcome to avoid scrollbars/overflow
        `}
      >
        <div className="w-full max-w-md relative pt-4">
           {/* BACK BUTTON: Now positioned RELATIVE inside the flow, slightly above form */}
           {!isWelcome && (
             <button 
              onClick={() => { setView('welcome'); setError(''); }}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
            >
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-indigo-500 group-hover:border-indigo-500 transition-all">
                 <ChevronLeft className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.1em]">Back</span>
            </button>
           )}

            <AnimatePresence mode="wait">
              {view === 'welcome' && (
                <motion.div 
                  key="welcome-mobile"
                  className="lg:hidden flex flex-col gap-4 w-full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                   <button 
                       onClick={() => setView('login')}
                       className="w-full py-4 bg-indigo-600 font-bold rounded-xl text-white shadow-lg shadow-indigo-500/20"
                     >
                       Sign In
                     </button>
                     <button 
                       onClick={() => setView('signup')}
                       className="w-full py-4 bg-slate-800 font-bold rounded-xl text-white border border-slate-700/50"
                     >
                       Create Account
                     </button>
                </motion.div>
              )}

              {view === 'login' && (
                <motion.div
                  key="login-form"
                  initial={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
                  transition={{ duration: 0.4, ease: "circOut" }}
                >
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-slate-400">Authentication required for access.</p>
                  </div>

                  {error && (
                    <div className="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm py-3 px-4 rounded-lg flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                      {error}
                    </div>
                  )}
                  
                  {success && (
                    <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm py-3 px-4 rounded-lg flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      {success}
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Email Identity</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-700 hover:border-slate-700"
                          placeholder="user@nexus.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Passcode</label>
                        <button type="button" onClick={() => navigate('/forgot-password')} className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors">RECOVERY?</button>
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        <input 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-700 hover:border-slate-700"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span>Authenticate</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="relative py-6 flex items-center gap-4">
                     <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
                     <span className="text-[10px] uppercase font-bold text-slate-600 tracking-widest">Or Connect With</span>
                     <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => googleLogin()} className="flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-slate-200 py-3 rounded-xl text-sm font-bold transition-all shadow-sm">
                      <Chrome className="w-4 h-4" />
                      Google
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-[#1877F2] text-white hover:bg-[#1864D9] py-3 rounded-xl text-sm font-bold transition-all shadow-sm">
                      <Facebook className="w-4 h-4" />
                      Facebook
                    </button>
                  </div>
                </motion.div>
              )}

              {view === 'signup' && (
                  <motion.div
                  key="signup-form"
                  initial={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
                  transition={{ duration: 0.4, ease: "circOut" }}
                >
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Initialize</h2>
                    <p className="text-slate-400">Establish your enterprise credentials.</p>
                  </div>

                  {error && (
                    <div className="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm py-3 px-4 rounded-lg flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Email Identity</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-700 hover:border-slate-700"
                          placeholder="user@nexus.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Passcode</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        <input 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-700 hover:border-slate-700"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Confirm Passcode</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        <input 
                          type="password" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-700 hover:border-slate-700"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                    >
                       {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span>Register System</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                   <div className="relative py-6 flex items-center gap-4">
                     <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
                     <span className="text-[10px] uppercase font-bold text-slate-600 tracking-widest">Or Connect With</span>
                     <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => googleLogin()} className="flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-slate-200 py-3 rounded-xl text-sm font-bold transition-all shadow-sm">
                      <Chrome className="w-4 h-4" />
                      Google
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-[#1877F2] text-white hover:bg-[#1864D9] py-3 rounded-xl text-sm font-bold transition-all shadow-sm">
                      <Facebook className="w-4 h-4" />
                      Facebook
                    </button>
                  </div>
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      </motion.div>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(1deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-pulse-slow {
          animation: pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
};

export default AuthPage;
