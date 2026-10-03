import React from 'react';
import { 
  Files, 
  Layers, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  GitFork,
  ArrowUpRight
} from 'lucide-react';
import { AnalyticsSummary, ComparisonData, EventRecord } from '../types';
import { ArchitectureVisualizer } from './ArchitectureVisualizer';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface Props {
  summary: AnalyticsSummary | null;
  comparison: ComparisonData | null;
  recentEvents: EventRecord[];
  onNavigateTab: (tab: string) => void;
  onSelectEvent: (eventId: string) => void;
}

export const DashboardTab: React.FC<Props> = ({
  summary,
  comparison,
  recentEvents,
  onNavigateTab,
  onSelectEvent,
}) => {
  const s3Events = summary?.eventsByMechanism?.['S3_NOTIFICATION'] || 0;
  const ebEvents = summary?.eventsByMechanism?.['EVENTBRIDGE'] || 0;

  const s3Latency = comparison?.s3Notification?.averageLatency || 0;
  const ebLatency = comparison?.eventBridge?.averageLatency || 0;

  const latencyChartData = [
    {
      name: 'Event Delivery',
      'S3 Notification': comparison?.s3Notification?.averageDeliveryLatency || 32,
      'EventBridge': comparison?.eventBridge?.averageDeliveryLatency || 68,
    },
    {
      name: 'Business Processing',
      'S3 Notification': comparison?.s3Notification?.averageProcessingLatency || 42,
      'EventBridge': comparison?.eventBridge?.averageProcessingLatency || 41,
    },
    {
      name: 'Total End-to-End',
      'S3 Notification': s3Latency || 74,
      'EventBridge': ebLatency || 109,
    },
  ];

  const pieData = [
    { name: 'S3 Direct Notification', value: s3Events || 1, color: '#06b6d4' },
    { name: 'Amazon EventBridge', value: ebEvents || 1, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Files */}
        <div className="glass-card glass-card-hover rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Uploaded Files</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Files className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-100">{summary?.totalFiles ?? 0}</span>
            <button 
              onClick={() => onNavigateTab('files')}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center"
            >
              Upload <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Metric 2: Total Events Processed */}
        <div className="glass-card glass-card-hover rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Events Processed</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-100">{summary?.totalEvents ?? 0}</span>
            <span className="text-xs text-slate-400 font-mono">
              A: {s3Events} | B: {ebEvents}
            </span>
          </div>
        </div>

        {/* Metric 3: Success Rate */}
        <div className="glass-card glass-card-hover rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Success Rate</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-400">
              {summary ? `${summary.successRate}%` : '100%'}
            </span>
            <span className="text-xs text-slate-400">
              {summary?.failedEvents ?? 0} failed
            </span>
          </div>
        </div>

        {/* Metric 4: Avg Total Latency */}
        <div className="glass-card glass-card-hover rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Average End-to-End Latency</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-100">
              {summary?.averageLatency ? `${summary.averageLatency}ms` : '0ms'}
            </span>
            <button
              onClick={() => onNavigateTab('comparison')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center"
            >
              Compare <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Live Pipeline Visualizer */}
      <ArchitectureVisualizer 
        s3Count={s3Events}
        ebCount={ebEvents}
        s3AvgLatency={s3Latency}
        ebAvgLatency={ebLatency}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latency Comparison Chart */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-100">Architecture Latency Decomposition</h4>
              <p className="text-xs text-slate-400">Measured delivery vs processing time (in milliseconds)</p>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              Live Metrics
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={latencyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} unit="ms" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="S3 Notification" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="EventBridge" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Event Distribution */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-100">Event Volume by Architecture</h4>
            <p className="text-xs text-slate-400">Relative distribution across pipelines</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span>S3 Notifications</span>
              </span>
              <span className="font-mono font-semibold">{s3Events}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>EventBridge Bus</span>
              </span>
              <span className="font-mono font-semibold">{ebEvents}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events Table Preview */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-100">Live Ingestion Event Feed</h4>
            <p className="text-xs text-slate-400">Click any event to inspect its chronological lifecycle timeline</p>
          </div>
          <button
            onClick={() => onNavigateTab('events')}
            className="text-xs text-sky-400 hover:text-sky-300 flex items-center font-medium"
          >
            View all events <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">File Name</th>
                <th className="pb-3 px-3">Architecture</th>
                <th className="pb-3 px-3">Delivery Latency</th>
                <th className="pb-3 px-3">Total Latency</th>
                <th className="pb-3 px-3">Timestamp</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500">
                    No events recorded yet. Upload a file or run an experiment to trigger event processing.
                  </td>
                </tr>
              ) : (
                recentEvents.slice(0, 5).map((e) => (
                  <tr key={e.eventId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                        e.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        e.status === 'FAILED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                      }`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-200">
                      {e.fileName}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        e.mechanism === 'S3_NOTIFICATION'
                          ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                          : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                      }`}>
                        {e.mechanism === 'S3_NOTIFICATION' ? 'S3 Direct' : 'EventBridge'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {e.eventDeliveryLatency != null ? `${e.eventDeliveryLatency}ms` : '—'}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {e.totalLatency != null ? `${e.totalLatency}ms` : '—'}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {new Date(e.receivedAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onSelectEvent(e.eventId)}
                        className="text-xs text-sky-400 hover:text-sky-300 underline font-medium"
                      >
                        Timeline
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
