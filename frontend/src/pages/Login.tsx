import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Github, Chrome, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      // Try to get the specific message from backend, otherwise fallback
      const msg = err.response?.data?.error || err.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const { data } = await axios.post(`${API_BASE}/auth/google-login`, { 
          idToken: tokenResponse.access_token // Note: In a real app, you'd use the ID token or auth code
        });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        navigate('/');
      } catch (err: any) {
        setError('Google login failed. Please ensure your Client ID is valid.');
      }
    },
    onError: () => setError('Google Login Failed'),
  });

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans selection:bg-blue-500/30 overflow-hidden relative">
      {/* Background for Form Side */}
      <div className="absolute inset-0 bg-slate-950 z-0"></div>

      {/* Left Side: Visual Branding (The "Lid" / Book Cover) */}
      <motion.div 
        initial={{ width: '100%', borderTopRightRadius: '0px', borderBottomRightRadius: '0px' }}
        animate={{ width: '50%', borderTopRightRadius: '60px', borderBottomRightRadius: '60px' }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex relative z-20 bg-slate-900 overflow-hidden shadow-[20px_0_50px_rgba(0,0,0,0.5)] border-r border-slate-800/50"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-slate-950 to-purple-600/20 z-0"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 z-10 pointer-events-none"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="relative z-20 flex flex-col items-center justify-center w-full p-12 text-center"
        >
          <div className="mb-8 relative">
            <div className="absolute -inset-4 bg-blue-500/20 blur-2xl rounded-full"></div>
            <img src="/logo.png" alt="Nexus Logo" className="w-64 h-64 object-contain relative drop-shadow-2xl animate-float" />
          </div>
          
          <h1 className="text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            Elevating <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Enterprise</span> <br /> Intelligence
          </h1>
          <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
            The nexus of seamless operations and forward-thinking scale. Securely manage your infrastructure with precision.
          </p>

          <div className="mt-16 grid grid-cols-2 gap-4 w-full max-w-sm">
            <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-white text-xs font-bold">Hardened</p>
                <p className="text-slate-500 text-[10px]">Auth Protocol</p>
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Lock className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-white text-xs font-bold">Encrypted</p>
                <p className="text-slate-500 text-[10px]">Active Sessions</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Right Side: Auth Form (Slides out from behind) */}
      <motion.div 
        initial={{ x: '-100%', opacity: 0 }}
        animate={{ x: '0%', opacity: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-950 relative z-10"
      >
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img src="/logo.png" alt="Nexus Logo" className="w-20 h-20" />
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-slate-400">Enter your credentials to access your dashboard.</p>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm py-4 px-5 rounded-2xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                    placeholder="name@nexus.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Password</label>
                  <Link to="/forgot-password" className="text-[11px] font-bold text-blue-500 hover:text-blue-400 transition-colors">FORGOT?</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-[0_8px_30px_rgb(37,99,235,0.2)] transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="relative py-4 flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-slate-800"></div>
              <span className="text-[10px] uppercase font-bold text-slate-600 tracking-widest whitespace-nowrap px-2">Secure Social Access</span>
              <div className="h-[1px] flex-1 bg-slate-800"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => googleLogin()}
                className="flex items-center justify-center gap-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 py-3.5 rounded-2xl text-sm font-semibold transition-all hover:bg-slate-800"
              >
                <Chrome className="w-4 h-4" />
                Google
              </button>
              <button className="flex items-center justify-center gap-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 py-3.5 rounded-2xl text-sm font-semibold transition-all hover:bg-slate-800">
                <Github className="w-4 h-4" />
                GitHub
              </button>
            </div>

            <p className="text-center text-slate-500 text-sm mt-8">
              Don't have an enterprise account? {' '}
              <Link to="/signup" className="text-blue-500 font-bold hover:underline">Request Access</Link>
            </p>
          </div>
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
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;
