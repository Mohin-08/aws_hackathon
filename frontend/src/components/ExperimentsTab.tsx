import React, { useState } from 'react';
import { 
  FlaskConical, 
  Play, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import { ExperimentRecord } from '../types';
import { api } from '../services/api';

interface Props {
  experiments: ExperimentRecord[];
  onRefresh: () => void;
}

export const ExperimentsTab: React.FC<Props> = ({ experiments, onRefresh }) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('Benchmark Test Run');
  const [architecture, setArchitecture] = useState<string>('BOTH');
  const [eventCount, setEventCount] = useState<number>(10);
  const [notes, setNotes] = useState<string>('');
  const [runningId, setRunningId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const exp = await api.createExperiment({
        name,
        architecture,
        eventCount,
        notes
      });
      setShowModal(false);
      onRefresh();
      // Automatically run experiment
      handleRun(exp.experimentId);
    } catch (err: any) {
      alert('Error creating experiment: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRun = async (expId: string) => {
    setRunningId(expId);
    try {
      await api.runExperiment(expId);
      onRefresh();
    } catch (err: any) {
      alert('Experiment execution failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setRunningId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Quick Run */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <FlaskConical className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-semibold text-slate-100">
                Controlled Benchmarking Suite
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Execute controlled workloads (10, 25, 50 synthetic test files) to measure real P50, P95, and duration
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowModal(true)}
              className="px-3.5 py-2 rounded-lg bg-purple-500 hover:bg-purple-400 text-white font-medium text-xs flex items-center space-x-1.5 shadow-md shadow-purple-500/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Benchmark Experiment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Quick Benchmarks */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[10, 25, 50].map((count) => (
          <div key={count} className="glass-card rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-300">Quick Benchmark: {count} Files</div>
              <p className="text-[11px] text-slate-500 mt-1">
                Executes {count} files simultaneously through both S3 Notifications & EventBridge
              </p>
            </div>
            <button
              onClick={async () => {
                const exp = await api.createExperiment({
                  name: `Quick ${count}-File Side-by-Side Test`,
                  architecture: 'BOTH',
                  eventCount: count,
                  notes: 'Quick preset benchmark run'
                });
                onRefresh();
                handleRun(exp.experimentId);
              }}
              disabled={runningId !== null}
              className="mt-4 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 border border-slate-700 text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Launch {count}-File Run</span>
            </button>
          </div>
        ))}
      </div>

      {/* Experiments History Table */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-slate-100">Benchmark Experiment History</h4>
          <button
            onClick={onRefresh}
            className="p-1 rounded-md hover:bg-slate-800 text-slate-400"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3 px-3">Name / ID</th>
                <th className="pb-3 px-3">Architecture</th>
                <th className="pb-3 px-3">Files / Events</th>
                <th className="pb-3 px-3">Success / Fail</th>
                <th className="pb-3 px-3">Average Latency</th>
                <th className="pb-3 px-3">P50</th>
                <th className="pb-3 px-3">P95</th>
                <th className="pb-3 px-3">Duration</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {experiments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    No experiments executed yet. Click "New Benchmark Experiment" to start.
                  </td>
                </tr>
              ) : (
                experiments.map((exp) => (
                  <tr key={exp.experimentId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-200">{exp.name}</div>
                      <div className="font-mono text-[10px] text-slate-500">{exp.experimentId}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        exp.architecture === 'BOTH' ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' :
                        exp.architecture === 'S3_NOTIFICATION' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' :
                        'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}>
                        {exp.architecture}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {exp.eventCount} files
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      <span className="text-emerald-400">{exp.successCount}</span> / <span className="text-rose-400">{exp.failureCount}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-200">
                      {exp.averageLatency != null ? `${exp.averageLatency}ms` : '—'}
                    </td>
                    <td className="py-3 px-3 font-mono text-sky-400 font-semibold">
                      {exp.p50 != null ? `${exp.p50}ms` : '—'}
                    </td>
                    <td className="py-3 px-3 font-mono text-amber-400 font-semibold">
                      {exp.p95 != null ? `${exp.p95}ms` : '—'}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">
                      {exp.totalDuration != null ? `${exp.totalDuration}ms` : '—'}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                        exp.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        exp.status === 'RUNNING' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 animate-pulse' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {runningId === exp.experimentId ? 'RUNNING...' : exp.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {exp.status !== 'RUNNING' && (
                        <button
                          onClick={() => handleRun(exp.experimentId)}
                          disabled={runningId !== null}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-medium border border-slate-700 disabled:opacity-50"
                        >
                          Run Again
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-700/80 p-6 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-100 mb-1">
              Configure Benchmark Experiment
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Select workload size and architecture to record performance metrics
            </p>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Experiment Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Architecture</label>
                <select
                  value={architecture}
                  onChange={(e) => setArchitecture(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="BOTH">Both (Side-by-side comparative benchmark)</option>
                  <option value="S3_NOTIFICATION">Architecture A (S3 Notification)</option>
                  <option value="EVENTBRIDGE">Architecture B (Amazon EventBridge)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Workload File Count</label>
                <select
                  value={eventCount}
                  onChange={(e) => setEventCount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value={10}>10 files (Fast baseline)</option>
                  <option value={25}>25 files (Medium load)</option>
                  <option value={50}>50 files (High throughput stress)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Notes / Description</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes regarding network conditions or run parameters..."
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-white font-medium disabled:opacity-50"
                >
                  {submitting ? 'Starting...' : 'Create & Run'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
