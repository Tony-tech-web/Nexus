import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  LogOut, 
  Plus, 
  Search,
  Bell,
  Settings as SettingsIcon,
  TrendingUp,
  AlertTriangle,
  Zap,
  X,
  RefreshCcw,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './utils/cn';

// Pages
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Settings from './pages/Settings';

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("p-6 rounded-3xl border transition-all duration-500", className)}>
    {children}
  </div>
);

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stockLevel: number;
  lowStockThreshold: number;
}

interface Order {
  id: string;
  customerName: string;
  status: 'PENDING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
  totalPrice: number;
  createdAt: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  role: string;
}

const API_BASE = 'http://localhost:3001/api';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [scrolled, setScrolled] = useState(false);
  const [isHeliumMode, setIsHeliumMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const navigate = useNavigate();

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }, []);

  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<'product' | 'order'>('product');

  const fetchData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const headers = getHeaders();
      
      const meRes = await fetch(`${API_BASE}/auth/me`, { headers });
      if (meRes.status === 401) {
        localStorage.removeItem('accessToken');
        navigate('/login');
        return;
      }
      if (meRes.ok) setUser(await meRes.json());

      const prodRes = await fetch(`${API_BASE}/inventory`, { headers });
      if (prodRes.ok) setProducts(await prodRes.json());

      const orderRes = await fetch(`${API_BASE}/orders`, { headers });
      if (orderRes.ok) setOrders(await orderRes.json());

      const notifRes = await fetch(`${API_BASE}/notifications`, { headers });
      if (notifRes.ok) setNotifications(await notifRes.json());
      
      const usersRes = await fetch(`${API_BASE}/auth/users`, { headers });
      if (usersRes.ok) setUsers(await usersRes.json());

    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setIsSyncing(false);
    }
  }, [getHeaders, navigate]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    fetchData();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchData]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'users', label: 'Users', icon: Users },
  ];

  const stats = useMemo(() => [
    { label: 'Inventory', value: products.length.toString(), trend: '+12%', icon: Package, color: isHeliumMode ? 'text-blue-400' : 'text-blue-500' },
    { label: 'Active Orders', value: orders.filter(o => o.status !== 'COMPLETED').length.toString(), trend: 'LIVE', icon: ShoppingCart, color: isHeliumMode ? 'text-indigo-400' : 'text-indigo-500' },
    { label: 'Low Stock', value: products.filter(p => p.stockLevel <= p.lowStockThreshold).length.toString(), trend: 'WARNING', icon: AlertTriangle, color: isHeliumMode ? 'text-rose-400' : 'text-rose-500' },
    { label: 'Revenue', value: '$' + orders.reduce((sum, o) => sum + o.totalPrice, 0).toLocaleString(), trend: '+8%', icon: TrendingUp, color: isHeliumMode ? 'text-emerald-400' : 'text-emerald-500' },
  ], [products, orders, isHeliumMode]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orders.filter(o => 
    o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMarkAsRead = async (id: string) => {
    try {
      const headers = getHeaders();
      await fetch(`${API_BASE}/notifications/${id}/read`, { 
        method: 'PATCH',
        headers
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { 
        method: 'POST', 
        headers: getHeaders() 
      });
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/login');
    }
  };

  if (showSettings) {
    return <Settings user={user} onUpdate={fetchData} onBack={() => setShowSettings(false)} />;
  }

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
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
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
              <span className={cn(isHeliumMode && "opacity-0 lg:opacity-100 transition-opacity whitespace-nowrap")}>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto border-t border-white/5 space-y-4">
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
            <span className={cn(isHeliumMode && "opacity-0 lg:opacity-100 transition-opacity whitespace-nowrap", "text-xs font-bold")}>
              {isHeliumMode ? 'Helium Enabled' : 'Standard View'}
            </span>
          </button>

          <button 
            onClick={handleSignOut}
            className="w-full h-10 flex items-center gap-4 px-3 text-rose-500 hover:text-rose-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className={cn(isHeliumMode && "opacity-0 lg:opacity-100 transition-opacity whitespace-nowrap", "text-sm font-medium font-sans")}>Sign Out</span>
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
            <button 
              onClick={fetchData}
              disabled={isSyncing}
              className={cn(
                "p-2 rounded-lg transition-colors group",
                isSyncing ? "text-blue-500" : "text-slate-500 hover:text-white"
              )}
            >
              <RefreshCcw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
            </button>
            <button className="p-2 text-slate-500 hover:text-white transition-colors relative group">
              <Bell className="w-4 h-4" />
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              )}
              <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-2 hidden group-hover:block transition-all z-50">
                <div className="text-xs font-bold text-slate-400 mb-2 px-2 uppercase tracking-wider">Notifications</div>
                {notifications.length === 0 ? (
                  <div className="text-xs text-slate-500 px-2 font-sans">No notifications</div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => handleMarkAsRead(n.id)}
                      className={`text-xs p-2 rounded-lg mb-1 cursor-pointer hover:bg-white/5 transition-colors font-sans ${n.isRead ? 'opacity-50' : 'font-semibold text-white'}`}
                    >
                      {n.message}
                    </div>
                  ))
                )}
              </div>
            </button>
            <div className="h-8 w-px bg-white/5 mx-2" />
            <div onClick={() => setShowSettings(true)} className="flex items-center gap-3 cursor-pointer group">
               <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-white group-hover:border-blue-500/50 transition-colors">
                 {user?.email[0].toUpperCase() || 'A'}
               </div>
               {!isHeliumMode && <span className="text-xs font-bold font-sans">{user?.role || 'Admin'}</span>}
            </div>
          </div>
        </header>

        <div className="p-10 w-full space-y-12">
          {/* Hero */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2"
          >
            {isHeliumMode && <span className="text-white/30 text-[10px] uppercase tracking-[0.3em] font-black font-sans">Nexus Intelligence</span>}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className={cn("font-bold tracking-tighter transition-all font-sans", isHeliumMode ? "text-5xl text-white" : "text-4xl text-slate-100 uppercase")}>
                  {activeTab} {isHeliumMode && <span className="text-white/20">Control</span>}
                </h1>
                <p className="mt-1 text-slate-500 font-sans">Operational overview of your supply chain.</p>
              </div>
              {(activeTab === 'inventory' || activeTab === 'orders') && (
                <button 
                  onClick={() => {
                    setModalType(activeTab === 'inventory' ? 'product' : 'order');
                    setShowAddModal(true);
                  }}
                  className={cn(
                    "px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 active:scale-95 shadow-xl font-sans",
                    isHeliumMode 
                      ? "bg-white text-black hover:bg-slate-200 uppercase" 
                      : "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20"
                    )}>
                  <Plus className="w-5 h-5" />
                  New {activeTab === 'inventory' ? 'Product' : 'Order'}
                </button>
              )}
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
                <Card className={cn(
                  "group h-full",
                  isHeliumMode 
                    ? "bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.02]" 
                    : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                )}>
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn("p-2 rounded-xl transition-transform group-hover:scale-110", isHeliumMode ? "bg-white/[0.03]" : "bg-slate-800")}>
                      <stat.icon className={cn("w-5 h-5", stat.color)} />
                    </div>
                  </div>
                  <h3 className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest font-sans">{stat.label}</h3>
                  <div className="flex items-baseline justify-between mt-1">
                    <p className="text-3xl font-bold text-white tracking-tighter font-sans">{stat.value}</p>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full font-sans", 
                      isHeliumMode ? "bg-white/5 text-slate-400" : "bg-slate-800 " + stat.color
                    )}>{stat.trend}</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                <Card className="lg:col-span-2 p-8 h-[400px] flex flex-col justify-center items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-blue-600/10 flex items-center justify-center mb-6">
                    <LayoutDashboard className="w-10 h-10 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 font-sans">Welcome Back, {user?.role || 'Admin'}</h3>
                  <p className="text-slate-500 max-w-sm font-sans">Everything looks optimal. You have {products.filter(p => p.stockLevel <= p.lowStockThreshold).length} items requiring attention.</p>
                  <button 
                    onClick={() => setActiveTab('inventory')}
                    className="mt-8 px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold border border-slate-700 transition-all font-sans"
                  >
                    Manage Inventory
                  </button>
                </Card>
                <Card className="p-8 h-[400px]">
                  <h3 className="font-bold text-white mb-6 uppercase tracking-widest text-xs font-sans">Recent Orders</h3>
                  <div className="space-y-4 overflow-y-auto max-h-[280px] custom-scrollbar">
                    {orders.slice(0, 5).map(order => (
                      <div key={order.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 font-sans">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">{order.customerName}</span>
                          <span className="text-[10px] text-slate-600 uppercase">{order.id.substring(0,8)}</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-500">${order.totalPrice}</span>
                      </div>
                    ))}
                    {orders.length === 0 && <p className="text-slate-600 text-center py-10 font-sans">No recent orders</p>}
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'inventory' && (
              <motion.div
                key="inventory"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <Card className="overflow-hidden p-0">
                  <table className="w-full text-left border-collapse font-sans">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Product</th>
                        <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">SKU</th>
                        <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Price</th>
                        <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Stock</th>
                        <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map(product => (
                        <tr key={product.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                          <td className="p-6 text-sm font-bold text-white uppercase tracking-tight">{product.name}</td>
                          <td className="p-6 text-xs text-slate-500 font-mono uppercase">{product.sku}</td>
                          <td className="p-6 text-sm text-slate-300">${product.price}</td>
                          <td className="p-6">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                              product.stockLevel <= product.lowStockThreshold ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
                            )}>
                              {product.stockLevel} units
                            </span>
                          </td>
                          <td className="p-6">
                            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-600 hover:text-white">
                              <SettingsIcon className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredProducts.length === 0 && (
                    <div className="p-20 text-center">
                      <p className="text-slate-500 font-sans font-bold uppercase tracking-widest">No products found matching "{searchQuery}"</p>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <Card className="overflow-hidden p-0">
                  <table className="w-full text-left border-collapse font-sans">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Order ID</th>
                        <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Customer</th>
                        <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                        <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Total</th>
                        <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map(order => (
                        <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                          <td className="p-6 text-xs font-mono text-blue-400 uppercase">{order.id.substring(0,8)}</td>
                          <td className="p-6 text-sm font-bold text-white uppercase">{order.customerName}</td>
                          <td className="p-6">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                              order.status === 'PENDING' ? "bg-amber-500/10 text-amber-500" : 
                              order.status === 'SHIPPED' ? "bg-blue-500/10 text-blue-500" :
                              "bg-emerald-500/10 text-emerald-500"
                            )}>
                              {order.status}
                            </span>
                          </td>
                          <td className="p-6 text-sm text-slate-300 font-bold font-sans">${order.totalPrice}</td>
                          <td className="p-6 text-xs text-slate-600 font-sans">{new Date(order.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <Card className="overflow-hidden p-0">
                  <table className="w-full text-left border-collapse font-sans">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">User ID</th>
                        <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Email</th>
                        <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Role</th>
                        <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                          <td className="p-6 text-xs font-mono text-blue-400 uppercase">{u.id.substring(0, 8)}</td>
                          <td className="p-6 text-sm font-bold text-white">{u.email}</td>
                          <td className="p-6">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                              u.role === 'ADMIN' ? "bg-purple-500/10 text-purple-500" : "bg-slate-500/10 text-slate-500"
                            )}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-6 text-xs text-slate-600 uppercase">Active</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Add Record Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl font-sans"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">Add New {modalType === 'product' ? 'Product' : 'Order'}</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form className="space-y-6" onSubmit={async (e) => { 
                e.preventDefault(); 
                const formData = new FormData(e.currentTarget);
                const headers = getHeaders();
                
                try {
                  if (modalType === 'product') {
                    const res = await fetch(`${API_BASE}/inventory`, {
                      method: 'POST',
                      headers,
                      body: JSON.stringify({
                        name: formData.get('name'),
                        sku: (formData.get('sku') as string) || `SKU-${Math.floor(Math.random()*1000)}`,
                        price: formData.get('price'),
                        stockLevel: formData.get('stock'),
                        description: 'New product'
                      })
                    });
                    if (res.ok) {
                      const newProduct = await res.json();
                      setProducts([newProduct, ...products]);
                    }
                  } else {
                    const productId = formData.get('productId') as string;
                    const quantity = parseInt(formData.get('quantity') as string);

                    const res = await fetch(`${API_BASE}/orders`, {
                      method: 'POST',
                      headers,
                      body: JSON.stringify({
                        customerName: formData.get('customer'),
                        items: [
                          { productId, quantity } 
                        ]
                      })
                    });
                    if (res.ok) {
                      const newOrder = await res.json();
                      setOrders([newOrder, ...orders]);
                      fetchData(); 
                    }
                  }
                } catch (err) {
                  console.error('Creation failed', err);
                }
                setShowAddModal(false); 
              }}>
                {modalType === 'product' ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Product Name</label>
                      <input name="name" type="text" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 uppercase" placeholder="e.g. Pro Headphones" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Price ($)</label>
                        <input name="price" type="number" required step="0.01" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="99.99" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Stock</label>
                        <input name="stock" type="number" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="100" />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Customer Name</label>
                      <input name="customer" type="text" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 uppercase font-sans" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Product</label>
                      <select name="productId" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer uppercase font-sans">
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} - ${p.price}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Quantity</label>
                      <input name="quantity" type="number" defaultValue="1" min="1" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-sans" />
                    </div>
                  </>
                )}
                
                <button 
                  type="submit"
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 mt-4 active:scale-95 transition-all uppercase"
                >
                  Create {modalType === 'product' ? 'Product' : 'Order'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 20px; }
      `}</style>
    </div>
  );
};

import AuthPage from './pages/AuthPage';

const App: React.FC = () => {
  return (
    <Routes>
      {/* Route legacy login/signup to AuthPage with appropriate mode */}
      <Route path="/login" element={<AuthPage />} />
      <Route path="/signup" element={<AuthPage />} />
      <Route path="/welcome" element={<AuthPage />} />
      
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Protected Main App or Redirect to Login */}
      <Route path="/" element={
        localStorage.getItem('accessToken') ? <MainApp /> : <Navigate to="/welcome" replace />
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
