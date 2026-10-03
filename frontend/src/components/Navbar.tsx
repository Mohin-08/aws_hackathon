import React from 'react';
import { 
  Layers, 
  Files, 
  Activity, 
  GitFork, 
  BarChart3, 
  Scale, 
  FlaskConical, 
  Cpu, 
  CloudLightning 
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  systemStatus?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, systemStatus }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'files', label: 'File Management', icon: Files },
    { id: 'events', label: 'Event Explorer', icon: Layers },
    { id: 'rules', label: 'Routing Rules', icon: GitFork },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'comparison', label: 'Comparison', icon: Scale },
    { id: 'experiments', label: 'Experiments', icon: FlaskConical },
    { id: 'system', label: 'System Health', icon: Cpu },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-amber-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <CloudLightning className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-sky-400 via-cyan-300 to-amber-400 bg-clip-text text-transparent">
                  EventFlow
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-sky-400 border border-sky-500/30 font-medium">
                  AWS Hackathon
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                S3 Event Notifications vs Amazon EventBridge
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* System Health Badge */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('system')}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs transition-colors"
            >
              <div className={`w-2 h-2 rounded-full animate-pulse ${systemStatus === 'UP' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="text-slate-300 font-mono text-[11px]">
                {systemStatus === 'UP' ? 'AWS Lab Ready' : 'Connecting'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center space-x-1 overflow-x-auto py-2 border-t border-slate-800/60 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs whitespace-nowrap ${
                  isActive
                    ? 'bg-sky-500/20 text-sky-400 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
