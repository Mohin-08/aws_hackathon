import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  RotateCw, 
  Play, 
  Layers, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { EventRecord } from '../types';
import { api } from '../services/api';

interface Props {
  events: EventRecord[];
  onRefresh: () => void;
  onSelectEvent: (eventId: string) => void;
}

export const EventsTab: React.FC<Props> = ({ events, onRefresh, onSelectEvent }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [mechanismFilter, setMechanismFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const handleRetry = async (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    try {
      await api.retryEvent(eventId);
      onRefresh();
    } catch (err: any) {
      alert('Retry failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleReplay = async (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    try {
      await api.replayEvent(eventId);
      onRefresh();
    } catch (err: any) {
      alert('Replay failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const filteredEvents = events.filter(e => {
    const matchesSearch = !searchTerm ||
      e.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.eventId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.s3Key?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMech = !mechanismFilter || e.mechanism === mechanismFilter;
    const matchesStatus = !statusFilter || e.status === statusFilter;
    return matchesSearch && matchesMech && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search event ID, file, or key..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 w-64"
              />
            </div>

            <select
              value={mechanismFilter}
              onChange={(e) => setMechanismFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
            >
              <option value="">All Mechanisms</option>
              <option value="S3_NOTIFICATION">S3 Notification (Architecture A)</option>
              <option value="EVENTBRIDGE">Amazon EventBridge (Architecture B)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
            >
              <option value="">All Statuses</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="FAILED">FAILED</option>
              <option value="PROCESSING">PROCESSING</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>Showing {filteredEvents.length} of {events.length} events</span>
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3 px-3">Event ID</th>
                <th className="pb-3 px-3">File / Payload</th>
                <th className="pb-3 px-3">Architecture</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Delivery</th>
                <th className="pb-3 px-3">Processing</th>
                <th className="pb-3 px-3">Total Latency</th>
                <th className="pb-3 px-3">Timestamp</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No events found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((e) => (
                  <tr 
                    key={e.eventId} 
                    onClick={() => onSelectEvent(e.eventId)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-mono text-[11px] text-sky-400">
                      {e.eventId.substring(0, 8)}...
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-200">{e.fileName}</div>
                      <div className="text-[10px] text-slate-500 font-mono truncate max-w-xs">{e.s3Key}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        e.mechanism === 'S3_NOTIFICATION'
                          ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                          : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                      }`}>
                        {e.mechanism === 'S3_NOTIFICATION' ? 'S3 Direct' : 'EventBridge'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                        e.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        e.status === 'FAILED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                      }`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {e.eventDeliveryLatency != null ? `${e.eventDeliveryLatency}ms` : '—'}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {e.processingLatency != null ? `${e.processingLatency}ms` : '—'}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-100">
                      {e.totalLatency != null ? `${e.totalLatency}ms` : '—'}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {new Date(e.receivedAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1" onClick={(ev) => ev.stopPropagation()}>
                        {e.status === 'FAILED' && (
                          <button
                            onClick={(ev) => handleRetry(ev, e.eventId)}
                            className="p-1 rounded text-emerald-400 hover:bg-emerald-500/10"
                            title="Retry event"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={(ev) => handleReplay(ev, e.eventId)}
                          className="p-1 rounded text-sky-400 hover:bg-sky-500/10"
                          title="Replay event"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectEvent(e.eventId)}
                          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                          title="Inspect timeline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
