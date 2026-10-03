import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardTab } from './components/DashboardTab';
import { FilesTab } from './components/FilesTab';
import { EventsTab } from './components/EventsTab';
import { RulesTab } from './components/RulesTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { ComparisonTab } from './components/ComparisonTab';
import { ExperimentsTab } from './components/ExperimentsTab';
import { SystemHealthTab } from './components/SystemHealthTab';
import { EventTimelineModal } from './components/EventTimelineModal';
import { 
  FileRecord, 
  EventRecord, 
  RuleRecord, 
  ExperimentRecord, 
  AnalyticsSummary, 
  ComparisonData, 
  LatencyMetrics, 
  ErrorAnalytics, 
  SystemHealth 
} from './types';
import { api } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Application Data States
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [rules, setRules] = useState<RuleRecord[]>([]);
  const [experiments, setExperiments] = useState<ExperimentRecord[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [latencyMetrics, setLatencyMetrics] = useState<LatencyMetrics | null>(null);
  const [errorAnalytics, setErrorAnalytics] = useState<ErrorAnalytics | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);

  const fetchAllData = async () => {
    try {
      const [
        filesRes,
        eventsRes,
        rulesRes,
        expRes,
        summaryRes,
        compRes,
        latencyRes,
        errorsRes,
        healthRes
      ] = await Promise.allSettled([
        api.getFiles(),
        api.getEvents(),
        api.getRules(),
        api.getExperiments(),
        api.getAnalyticsSummary(),
        api.getComparison(),
        api.getLatencyMetrics(),
        api.getErrorAnalytics(),
        api.getSystemHealth()
      ]);

      if (filesRes.status === 'fulfilled') setFiles(filesRes.value);
      if (eventsRes.status === 'fulfilled') setEvents(eventsRes.value);
      if (rulesRes.status === 'fulfilled') setRules(rulesRes.value);
      if (expRes.status === 'fulfilled') setExperiments(expRes.value);
      if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value);
      if (compRes.status === 'fulfilled') setComparison(compRes.value);
      if (latencyRes.status === 'fulfilled') setLatencyMetrics(latencyRes.value);
      if (errorsRes.status === 'fulfilled') setErrorAnalytics(errorsRes.value);
      if (healthRes.status === 'fulfilled') setHealth(healthRes.value);
    } catch (e) {
      console.warn('Initial fetch caught error:', e);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 4000); // Polling every 4 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        systemStatus={health?.status} 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardTab
            summary={summary}
            comparison={comparison}
            recentEvents={events}
            onNavigateTab={setActiveTab}
            onSelectEvent={setSelectedEventId}
          />
        )}

        {activeTab === 'files' && (
          <FilesTab
            files={files}
            onRefresh={fetchAllData}
            onSelectEventByFile={(fileId) => {
              const matched = events.find(e => e.fileId === fileId);
              if (matched) setSelectedEventId(matched.eventId);
            }}
          />
        )}

        {activeTab === 'events' && (
          <EventsTab
            events={events}
            onRefresh={fetchAllData}
            onSelectEvent={setSelectedEventId}
          />
        )}

        {activeTab === 'rules' && (
          <RulesTab
            rules={rules}
            onRefresh={fetchAllData}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab
            summary={summary}
            latencyMetrics={latencyMetrics}
            errorAnalytics={errorAnalytics}
          />
        )}

        {activeTab === 'comparison' && (
          <ComparisonTab
            comparison={comparison}
          />
        )}

        {activeTab === 'experiments' && (
          <ExperimentsTab
            experiments={experiments}
            onRefresh={fetchAllData}
          />
        )}

        {activeTab === 'system' && (
          <SystemHealthTab
            health={health}
            onRefresh={fetchAllData}
          />
        )}
      </main>

      {/* Global Event Timeline Modal */}
      <EventTimelineModal
        eventId={selectedEventId}
        onClose={() => setSelectedEventId(null)}
        onEventUpdated={fetchAllData}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>EventFlow &bull; S3 Event Notifications vs Amazon EventBridge Platform</span>
          <span>AWS Academy Learner Lab Compatible &bull; Java 21 + Spring Boot 3 + React + Vite</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
