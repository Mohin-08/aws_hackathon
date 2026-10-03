import React, { useState } from 'react';
import { 
  GitFork, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Layers, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { RuleRecord } from '../types';
import { api } from '../services/api';

interface Props {
  rules: RuleRecord[];
  onRefresh: () => void;
}

export const RulesTab: React.FC<Props> = ({ rules, onRefresh }) => {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [prefix, setPrefix] = useState<string>('uploads/custom/');
  const [eventType, setEventType] = useState<string>('Object Created');
  const [target, setTarget] = useState<string>('Lambda B - Custom Processor');
  const [description, setDescription] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await api.createRule({
        name,
        prefix,
        eventType,
        target,
        description,
        enabled: true
      });
      setShowCreateModal(false);
      setName('');
      setDescription('');
      onRefresh();
    } catch (err: any) {
      alert('Failed to create rule: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (rule: RuleRecord) => {
    try {
      await api.updateRule(rule.ruleId, {
        ...rule,
        enabled: !rule.enabled
      });
      onRefresh();
    } catch (err: any) {
      alert('Failed to update rule status: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (confirm('Delete this EventBridge routing rule?')) {
      try {
        await api.deleteRule(ruleId);
        onRefresh();
      } catch (err: any) {
        alert('Failed to delete rule: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <GitFork className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-semibold text-slate-100">
                Amazon EventBridge Routing Rule Engine
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Configure pattern-matching rules on the default bus to dynamically route S3 object events to specialized handlers
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium text-xs flex items-center space-x-1.5 shadow-md shadow-amber-500/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Rule</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule) => (
          <div 
            key={rule.ruleId} 
            className="glass-card glass-card-hover rounded-xl p-5 border border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">{rule.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{rule.description || 'EventBridge routing pattern'}</p>
                </div>
                <button
                  onClick={() => handleToggle(rule)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center space-x-1 ${
                    rule.enabled 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {rule.enabled ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>ENABLED</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3" />
                      <span>DISABLED</span>
                    </>
                  )}
                </button>
              </div>

              {/* Event Pattern Preview */}
              <div className="mt-4 p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px] font-mono space-y-1.5">
                <div className="text-slate-500 text-[10px] uppercase">Matching Pattern:</div>
                <div className="text-slate-300">
                  <span className="text-amber-400">prefix</span>: "{rule.prefix}"
                </div>
                <div className="text-slate-300">
                  <span className="text-cyan-400">event-type</span>: "{rule.eventType}"
                </div>
                <div className="text-slate-300 flex items-center space-x-1 pt-1 border-t border-slate-800/60">
                  <ArrowRight className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="text-emerald-400 truncate">Target: {rule.target}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono text-[10px]">Rule ID: {rule.ruleId}</span>
              <button
                onClick={() => handleDelete(rule.ruleId)}
                className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                title="Delete rule"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Rule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-700/80 p-6 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-100 mb-1">
              Create EventBridge Routing Rule
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Events matching this prefix will trigger the specified target processor
            </p>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Audit Logs Rule"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">S3 Key Prefix</label>
                <input
                  type="text"
                  required
                  placeholder="uploads/contracts/"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Event Type</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Object Created">Object Created</option>
                  <option value="Object Deleted">Object Deleted</option>
                  <option value="All Events">All Events</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Lambda Processor</label>
                <input
                  type="text"
                  required
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description</label>
                <textarea
                  placeholder="Optional rule description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
