import React, { useEffect, useState } from 'react';
import { 
  X, 
  RotateCw, 
  Play, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  Layers,
  ArrowRight,
  Cpu
} from 'lucide-react';
import { EventRecord, TimelineItem } from '../types';
import { api } from '../services/api';

interface Props {
  eventId: string | null;
  onClose: () => void;
  onEventUpdated: () => void;
}

export const EventTimelineModal: React.FC<Props> = ({ eventId, onClose, onEventUpdated }) => {
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  useEffect(() => {
    if (eventId) {
      loadEventDetails(eventId);
    }
  }, [eventId]);

  const loadEventDetails = async (id: string) => {
    setLoading(true);
    try {
      const [ev, tl] = await Promise.all([
        api.getEventById(id),
        api.getEventTimeline(id)
      ]);
      setEvent(ev);
      setTimeline(tl);
    } catch (err) {
      console.error('Error loading event timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!eventId) return;
    setActionLoading(true);
    try {
      await api.retryEvent(eventId);
      await loadEventDetails(eventId);
      onEventUpdated();
    } catch (err: any) {
      alert('Retry error: ' + (err.response?.data?.error || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReplay = async () => {
    if (!eventId) return;
    setActionLoading(true);
    try {
      const newEv = await api.replayEvent(eventId);
      alert('Event successfully replayed! New event ID: ' + newEv.eventId);
      onEventUpdated();
      onClose();
    } catch (err: any) {
      alert('Replay error: ' + (err.response?.data?.error || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  if (!eventId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              event?.mechanism === 'S3_NOTIFICATION' ? 'bg-cyan-500/15 text-cyan-400' : 'bg-amber-500/15 text-amber-400'
            }`}>
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-slate-100">
                  Event Lifecycle Timeline
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                  event?.mechanism === 'S3_NOTIFICATION' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {event?.mechanism}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-md">
                ID: {eventId}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Loading event lifecycle data...
            </div>
          ) : (
            <>
              {/* Event Metadata Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-mono">Status</div>
                  <div className={`font-semibold mt-1 ${
                    event?.status === 'SUCCESS' ? 'text-emerald-400' :
                    event?.status === 'FAILED' ? 'text-rose-400' : 'text-sky-400'
                  }`}>
                    {event?.status}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-mono">Delivery Latency</div>
                  <div className="font-semibold text-slate-200 mt-1 font-mono">
                    {event?.eventDeliveryLatency != null ? `${event.eventDeliveryLatency}ms` : '—'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-mono">Compute Latency</div>
                  <div className="font-semibold text-slate-200 mt-1 font-mono">
                    {event?.processingLatency != null ? `${event.processingLatency}ms` : '—'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-mono">Total Latency</div>
                  <div className="font-semibold text-sky-400 mt-1 font-mono">
                    {event?.totalLatency != null ? `${event.totalLatency}ms` : '—'}
                  </div>
                </div>
              </div>

              {/* Chronological Stage Progression */}
              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
                  Lifecycle Progression
                </h4>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {timeline.map((item, idx) => (
                    <div key={idx} className="relative">
                      {/* Timeline Dot */}
                      <span className={`absolute -left-6 top-1 w-4 h-4 rounded-full flex items-center justify-center ${
                        item.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                        item.status === 'FAILED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                        item.status === 'WARNING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                        'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      </span>

                      {/* Timeline Content */}
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-200">
                            {item.stage}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {item.details}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Details if any */}
              {event?.errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs">
                  <div className="flex items-center space-x-2 text-rose-400 font-medium mb-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>Error Category: {event.errorCategory || 'LAMBDA_ERROR'}</span>
                  </div>
                  <p className="text-rose-300 font-mono text-[11px]">
                    {event.errorMessage}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="text-[11px] text-slate-400">
            Retries: {event?.retryCount || 0}
          </div>

          <div className="flex items-center space-x-2">
            {event?.status === 'FAILED' && (
              <button
                onClick={handleRetry}
                disabled={actionLoading}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-medium text-xs flex items-center space-x-1.5 shadow-sm"
              >
                <RotateCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
                <span>Retry Event</span>
              </button>
            )}

            <button
              onClick={handleReplay}
              disabled={actionLoading}
              className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-medium text-xs flex items-center space-x-1.5 shadow-sm"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Replay Event</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
