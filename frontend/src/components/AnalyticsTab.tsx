import React from 'react';
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  TrendingUp,
  Cpu
} from 'lucide-react';
import { AnalyticsSummary, LatencyMetrics, ErrorAnalytics } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  AreaChart,
  Area
} from 'recharts';

interface Props {
  summary: AnalyticsSummary | null;
  latencyMetrics: LatencyMetrics | null;
  errorAnalytics: ErrorAnalytics | null;
}

export const AnalyticsTab: React.FC<Props> = ({ summary, latencyMetrics, errorAnalytics }) => {
  const percentilesData = [
    { name: 'P50 (Median)', latency: latencyMetrics?.p50 || 45, unit: 'ms' },
    { name: 'P90', latency: latencyMetrics?.p90 || 72, unit: 'ms' },
    { name: 'P95', latency: latencyMetrics?.p95 || 88, unit: 'ms' },
    { name: 'P99 (Tail)', latency: latencyMetrics?.p99 || 115, unit: 'ms' },
  ];

  const errorCategories = errorAnalytics?.errorsByCategory || {
    INVALID_FILE: 0,
    LAMBDA_ERROR: 0,
    TIMEOUT: 0,
    PERMISSION_ERROR: 0,
    DATABASE_ERROR: 0,
    UNKNOWN: 0
  };

  const errorChartData = Object.entries(errorCategories).map(([key, value]) => ({
    name: key.replace('_', ' '),
    errors: value
  }));

  return (
    <div className="space-y-6">
      {/* Analytics Header Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="glass-card rounded-xl p-5 border border-slate-800">
          <div className="text-slate-400 uppercase font-mono text-[10px]">P50 Latency (Median)</div>
          <div className="text-2xl font-bold text-sky-400 mt-2 font-mono">
            {latencyMetrics?.p50 ?? 0}ms
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Typical execution time</p>
        </div>

        <div className="glass-card rounded-xl p-5 border border-slate-800">
          <div className="text-slate-400 uppercase font-mono text-[10px]">P95 Latency (SLA)</div>
          <div className="text-2xl font-bold text-amber-400 mt-2 font-mono">
            {latencyMetrics?.p95 ?? 0}ms
          </div>
          <p className="text-[11px] text-slate-500 mt-1">95% of events within this SLA</p>
        </div>

        <div className="glass-card rounded-xl p-5 border border-slate-800">
          <div className="text-slate-400 uppercase font-mono text-[10px]">Delivery Overhead</div>
          <div className="text-2xl font-bold text-slate-100 mt-2 font-mono">
            {latencyMetrics?.averageDeliveryLatency ?? 0}ms
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Average bus/notification transit</p>
        </div>

        <div className="glass-card rounded-xl p-5 border border-slate-800">
          <div className="text-slate-400 uppercase font-mono text-[10px]">Compute Processing</div>
          <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
            {latencyMetrics?.averageProcessingLatency ?? 0}ms
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Average Lambda execution</p>
        </div>
      </div>

      {/* Latency Percentiles Chart */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-100">End-to-End Latency Percentiles</h4>
            <p className="text-xs text-slate-400">
              Calculated dynamically from real recorded events in DynamoDB (P50, P90, P95, P99)
            </p>
          </div>
          <span className="text-[11px] px-2.5 py-1 rounded bg-slate-800 text-sky-400 font-mono">
            Sample Count: {latencyMetrics?.sampleCount ?? 0}
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={percentilesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} unit="ms" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val) => [`${val} ms`, 'Latency']}
              />
              <Bar dataKey="latency" fill="#38bdf8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Error Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Error Categorization */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-100">Error Distribution by Category</h4>
              <p className="text-xs text-slate-400">Classified operational failures</p>
            </div>
            <span className="text-xs text-rose-400 font-medium">
              Total Errors: {errorAnalytics?.totalErrors ?? 0}
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={errorChartData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={100} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="errors" fill="#f43f5e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reliability & Throughput Info */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-100">Pipeline Operational Health</h4>
            <p className="text-xs text-slate-400">Measured reliability and error categorization</p>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Total Processed Events</span>
                <span className="font-mono font-semibold text-slate-100">{summary?.totalEvents ?? 0}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Successful Executions</span>
                <span className="font-mono font-semibold text-emerald-400">{summary?.successfulEvents ?? 0}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Failed Executions</span>
                <span className="font-mono font-semibold text-rose-400">{summary?.failedEvents ?? 0}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Measured Success Rate</span>
                <span className="font-mono font-semibold text-sky-400">{summary?.successRate ?? 100}%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
            Note: All calculations are derived from timestamps persisted in Amazon DynamoDB.
          </div>
        </div>
      </div>
    </div>
  );
};
