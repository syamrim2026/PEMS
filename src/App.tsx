/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import AuthGate from './components/AuthGate';
import Dashboard from './components/Dashboard';
import MaterialList from './components/MaterialList';
import ReportViewer from './components/ReportViewer';
import Settings from './components/Settings';
import { LayoutDashboard, Package, BarChart3, Settings as SettingsIcon, LogOut, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type View = 'dashboard' | 'materials' | 'reports' | 'settings';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <motion.div 
          animate={{ scale: [1, 1.05, 1] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm overflow-hidden p-1 border border-gray-100">
            <img 
              src="https://logo.clearbit.com/hicomtecksee.com.my" 
              alt="Hicom-Teck See Logo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('bg-indigo-600');
                const icon = document.createElement('div');
                icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M10.3 21 12 19l1.7 2"/><path d="M8 5h8"/><path d="M12 5v14"/><path d="M12 9c2.8 0 5 2.2 5 5v3"/><path d="M7 14c0-2.8 2.2-5 5-5"/><path d="M17 14h2"/><path d="M5 14h2"/></svg>';
                e.currentTarget.parentElement?.appendChild(icon.firstChild as Node);
              }}
            />
          </div>
          <p className="text-gray-500 font-medium text-[10px] tracking-widest uppercase">System Syncing</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <AuthGate />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'materials', label: 'Inventory', icon: Package },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Notifications', icon: SettingsIcon },
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm overflow-hidden p-1 border border-gray-100 shrink-0 relative">
            <img 
              src="https://logo.clearbit.com/hicomtecksee.com.my" 
              alt="Logo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <Building2 className="text-gray-200 absolute -z-10" size={18} />
          </div>
          <h1 className="font-bold text-[11px] text-slate-800 tracking-tight leading-tight uppercase">HICOM-Teck See<br/><span className="text-indigo-600 text-[9px] font-black">Paint Systems</span></h1>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as View)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                  activeView === item.id 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mb-4 flex items-center gap-3">
            <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} alt="Avatar" className="w-8 h-8 rounded-full" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{user.displayName}</p>
              <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={() => auth.signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-red-600 rounded-lg transition-colors text-xs font-medium"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between shrink-0">
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
            {navItems.find(n => n.id === activeView)?.label || 'Overview'}
          </h2>
          <div className="flex items-center gap-4">
             {/* Header actions can be context-aware */}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                {activeView === 'dashboard' && <Dashboard />}
                {activeView === 'materials' && <MaterialList />}
                {activeView === 'reports' && <ReportViewer />}
                {activeView === 'settings' && <Settings />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
