import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  LogOut, 
  Plus, 
  Search,
  Bell,
  Settings,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Zap,
  Globe,
  Database,
  User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './components/ui/Card';
import { cn } from './utils/cn';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [scrolled, setScrolled] = useState(false);
  const [isHeliumMode, setIsHeliumMode] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
  ];

  const stats = [
    { label: 'Inventory', value: '1,284', trend: '+12%', icon: Package, color: isHeliumMode ? 'text-blue-400' : 'text-blue-500' },
    { label: 'Active Orders', value: '43', trend: '-5%', icon: ShoppingCart, color: isHeliumMode ? 'text-indigo-400' : 'text-indigo-500' },
    { label: 'Critical Stock', value: '8', trend: 'LOW', icon: AlertTriangle, color: isHeliumMode ? 'text-rose-400' : 'text-rose-500' },
    { label: 'Performance', value: '98%', trend: 'OPTIMAL', icon: TrendingUp, color: isHeliumMode ? 'text-emerald-400' : 'text-emerald-500' },
  ];

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-700 font-sans antialiased flex selection:bg-blue-500/20",
      isHeliumMode ? "bg-[#02040a] text-slate-400" : "bg-slate-950 text-slate-300"
    )}>
      {/* Sidebar */}
      <aside className={cn(
        "border-r transition-all duration-500 ease-in-out fixed h-full z-20 flex flex-col",
        isHeliumMode 
          ? "w-20 lg:w-64 bg-[#02040a] border-white/5" 
          : "w-64 bg-slate-900/50 backdrop-blur-xl border-slate-800"
      )}>
        <div className="h-20 flex items-center px-6 mb-8 pt-4">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all duration-300 transform group-hover:rotate-6 shadow-lg",
              isHeliumMode 
                ? "bg-white text-[#02040a] shadow-white/5" 
                : "bg-blue-600 text-white shadow-blue-600/20"
            )}>
              N
            </div>
            {!isHeliumMode && (
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white leading-none">Nexus</span>
                <span className="text-[10px] uppercase tracking-tighter text-slate-500 font-bold">Enterprise OMS</span>
              </div>
            )}
            {isHeliumMode && (
              <div className="absolute left-14 top-1 flex flex-col opacity-0 lg:opacity-100 transition-opacity">
                 <span className="text-lg font-bold tracking-tight text-white">Nexus</span>
                 <span className="text-[9px] uppercase tracking-tighter text-slate-500 font-bold">Helium Core</span>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative group",
                activeTab === item.id 
                  ? (isHeliumMode ? "text-white" : "bg-blue-600/10 text-blue-400") 
                  : (isHeliumMode ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:bg-slate-800/50 hover:text-white")
              )}
            >
              {activeTab === item.id && isHeliumMode && (
                <motion.div layoutId="activeNavBG" className="absolute inset-0 bg-white/[0.03] rounded-xl border border-white/[0.05]" />
              )}
              <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", activeTab === item.id ? (isHeliumMode ? "text-white" : "text-blue-500") : "text-slate-500")} />
              <span className={cn(isHeliumMode && "opacity-0 lg:opacity-100 transition-opacity")}>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto border-t border-white/5 space-y-4">
          {/* Mode Toggle */}
          <button 
            onClick={() => setIsHeliumMode(!isHeliumMode)}
            className={cn(
              "w-full h-10 flex items-center gap-4 px-3 rounded-xl transition-all duration-300 border",
              isHeliumMode 
                ? "bg-white/5 border-white/10 text-slate-400 hover:text-white" 
                : "bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-800"
            )}
          >
            <Zap className={cn("w-4 h-4", isHeliumMode ? "text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]" : "text-slate-400")} />
            <span className={cn(isHeliumMode && "opacity-0 lg:opacity-100 transition-opacity", "text-xs font-bold")}>
              {isHeliumMode ? 'Helium Enabled' : 'Standard View'}
            </span>
          </button>

          <button className="w-full h-10 flex items-center gap-4 px-3 text-rose-500 hover:text-rose-400 transition-colors">
            <LogOut className="w-5 h-5" />
            <span className={cn(isHeliumMode && "opacity-0 lg:opacity-100 transition-opacity", "text-sm font-medium")}>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-500",
        "ml-64",
        isHeliumMode && "lg:ml-64 ml-20"
      )}>
        {/* Header */}
        <header className={cn(
          "h-20 flex items-center justify-between px-8 sticky top-0 z-10 transition-all duration-500",
          scrolled ? "backdrop-blur-2xl border-b border-white/5" : "bg-transparent",
          isHeliumMode ? (scrolled ? "bg-[#02040a]/80" : "") : (scrolled ? "bg-slate-950/80 border-slate-800" : "")
        )}>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder={isHeliumMode ? "Command..." : "Search everything..."} 
                className={cn(
                  "w-48 lg:w-64 rounded-xl py-2 pl-10 pr-4 text-xs transition-all duration-500 focus:outline-none",
                  isHeliumMode 
                    ? "bg-white/[0.03] border border-white/10 focus:w-80 focus:border-white/20" 
                    : "bg-slate-900 border border-slate-800 focus:ring-2 focus:ring-blue-500/20"
                )}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!isHeliumMode && (
              <div className="hidden md:flex items-center gap-4 text-xs font-semibold text-slate-500 px-4">
                 <div className="flex items-center gap-2"><Globe className="w-3 h-3 text-emerald-500" /> Sydney, AU</div>
                 <div className="flex items-center gap-2"><Database className="w-3 h-3 text-blue-500" /> v2.4.0</div>
              </div>
            )}
            <button className="p-2 text-slate-500 hover:text-white transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            </button>
            <div className="h-8 w-px bg-white/5 mx-2" />
            <div className="flex items-center gap-3 cursor-pointer group">
               <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-white group-hover:border-blue-500/50 transition-colors">
                 A
               </div>
               {!isHeliumMode && <span className="text-xs font-bold">Admin</span>}
            </div>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto w-full space-y-12">
          {/* Hero */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2"
          >
            {isHeliumMode && <span className="text-white/30 text-[10px] uppercase tracking-[0.3em] font-black">Nexus Intelligence</span>}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className={cn("font-bold tracking-tighter transition-all", isHeliumMode ? "text-5xl text-white" : "text-4xl text-slate-100")}>
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} {isHeliumMode && <span className="text-white/20">Control</span>}
                </h1>
                <p className="mt-1 text-slate-500">Operational overview of your supply chain.</p>
              </div>
              <button className={cn(
                "px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 active:scale-95 shadow-xl",
                isHeliumMode 
                  ? "bg-white text-black hover:bg-slate-200" 
                  : "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20"
                )}>
                <Plus className="w-5 h-5" />
                New {activeTab === 'inventory' ? 'Product' : 'Order'}
              </button>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={cn(
                  "p-6 rounded-3xl border transition-all duration-500 group",
                  isHeliumMode 
                    ? "bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.02]" 
                    : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                )}>
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn("p-2 rounded-xl transition-transform group-hover:scale-110", isHeliumMode ? "bg-white/[0.03]" : "bg-slate-800")}>
                      <stat.icon className={cn("w-5 h-5", stat.color)} />
                    </div>
                    {isHeliumMode && <span className="text-[10px] font-mono text-slate-600">{stat.trend}</span>}
                  </div>
                  <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-widest">{stat.label}</h3>
                  <div className="flex items-baseline justify-between mt-1">
                    <p className="text-3xl font-bold text-white tracking-tighter">{stat.value}</p>
                    {!isHeliumMode && <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800", stat.color.replace('text-', 'text-'))}>{stat.trend}</span>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Main Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + isHeliumMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              <Card className={cn(
                "min-h-[500px] border transition-all flex flex-col group relative overflow-hidden",
                isHeliumMode ? "bg-white/[0.01] border-white/[0.04]" : "bg-slate-900 border-slate-800"
              )}>
                 <div className={cn(
                   "p-6 border-b flex items-center justify-between",
                   isHeliumMode ? "border-white/[0.04] bg-white/[0.01]" : "border-slate-800 bg-slate-800/20"
                 )}>
                   <div className="flex items-center gap-3">
                     <span className={cn("h-4 w-1 rounded-full", isHeliumMode ? "bg-white/20" : "bg-blue-500")}></span>
                     <h3 className="font-bold text-white uppercase tracking-widest text-xs">Live System Feed</h3>
                   </div>
                   <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-white">
                      <MoreVertical className="w-5 h-5" />
                   </button>
                 </div>

                 <div className="flex-1 flex flex-col items-center justify-center p-20 relative z-10">
                    <motion.div 
                      animate={isHeliumMode ? { 
                        y: [-10, 10, -10],
                        scale: [1, 1.05, 1],
                      } : {}}
                      transition={{ duration: 6, repeat: Infinity }}
                      className={cn(
                        "w-48 h-48 rounded-full flex items-center justify-center border transition-all relative",
                        isHeliumMode ? "bg-white/5 border-white/10 backdrop-blur-3xl" : "bg-slate-800/50 border-slate-700 shadow-2xl"
                      )}
                    >
                      <Package className={cn("w-16 h-16 transition-colors duration-1000", isHeliumMode ? "text-white/20" : "text-blue-500/50")} />
                      {isHeliumMode && <div className="absolute -inset-10 bg-blue-500/10 blur-[100px] rounded-full animate-pulse transition-opacity"></div>}
                    </motion.div>

                    <h4 className="mt-12 text-2xl font-bold text-white tracking-tight">
                      {isHeliumMode ? 'Helium Node Active' : 'Nexus Enterprise Connected'}
                    </h4>
                    <p className="mt-2 text-slate-500 max-w-sm text-center text-sm leading-relaxed">
                      {isHeliumMode 
                        ? 'System operating in ultra-minimal lightweight mode.' 
                        : 'Your enterprise inventory network is synchronized and secure.'}
                    </p>
                    
                    {!isHeliumMode && (
                      <div className="mt-8 flex gap-3">
                        <button className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition-all">
                          View Inventory
                        </button>
                        <button className="px-6 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-xl text-xs font-bold border border-blue-500/20 transition-all">
                           API Logs
                        </button>
                      </div>
                    )}
                 </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 20px; }
      `}</style>
    </div>
  );
};

export default App;
