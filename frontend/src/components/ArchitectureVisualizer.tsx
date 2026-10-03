import React from 'react';
import { ArrowRight, Database, Server, Cpu, Cloud, GitBranch, Zap, Sparkles } from 'lucide-react';

interface Props {
  s3Count?: number;
  ebCount?: number;
  s3AvgLatency?: number;
  ebAvgLatency?: number;
}

export const ArchitectureVisualizer: React.FC<Props> = ({
  s3Count = 0,
  ebCount = 0,
  s3AvgLatency = 0,
  ebAvgLatency = 0,
}) => {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 shadow-2xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <h3 className="text-base font-semibold text-slate-100">Live Dual-Architecture Flow Pipeline</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Side-by-side comparison of S3 Direct Event Notifications vs Amazon EventBridge Routing
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
            <span className="text-slate-300">Architecture A (S3 Notification)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
            <span className="text-slate-300">Architecture B (EventBridge)</span>
          </div>
        </div>
      </div>

      {/* Pipeline Diagram */}
      <div className="space-y-5">
        {/* Common Ingestion Origin */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-sky-500/15 text-sky-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="font-medium text-slate-200">1. Client Upload</div>
              <div className="text-[11px] text-slate-400">React + TS Frontend</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <div className="font-medium text-slate-200">2. Validation & Deduplication</div>
              <div className="text-[11px] text-slate-400">Spring Boot Monolith (SHA-256)</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <div className="font-medium text-slate-200">3. Amazon S3 Bucket</div>
              <div className="text-[11px] text-slate-400">ObjectCreated event trigger</div>
            </div>
          </div>
        </div>

        {/* Branching Architectures */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
          {/* Architecture A: S3 Notification */}
          <div className="p-4 rounded-xl bg-gradient-to-b from-cyan-950/20 to-slate-900/80 border border-cyan-500/30 relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Architecture A — Direct S3 Notification
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {s3Count} events | avg {s3AvgLatency}ms
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 text-xs">
              <div className="flex-1 w-full p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-slate-400 text-[10px] uppercase font-mono">Event Source</div>
                <div className="font-medium text-slate-200">S3 Notification</div>
                <div className="text-[10px] text-cyan-400">Direct Push</div>
              </div>
              <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0 rotate-90 sm:rotate-0" />
              <div className="flex-1 w-full p-2.5 rounded-lg bg-slate-900/80 border border-cyan-500/40 text-center">
                <div className="text-slate-400 text-[10px] uppercase font-mono">Serverless Compute</div>
                <div className="font-medium text-slate-200">Lambda A</div>
                <div className="text-[10px] text-slate-400">Common Business Pipeline</div>
              </div>
              <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0 rotate-90 sm:rotate-0" />
              <div className="flex-1 w-full p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-slate-400 text-[10px] uppercase font-mono">Storage</div>
                <div className="font-medium text-slate-200">DynamoDB</div>
                <div className="text-[10px] text-emerald-400">EventFlowEvents</div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Characteristic: Point-to-point, tight coupling</span>
              <span className="text-cyan-400">Fastest direct delivery</span>
            </div>
          </div>

          {/* Architecture B: EventBridge */}
          <div className="p-4 rounded-xl bg-gradient-to-b from-amber-950/20 to-slate-900/80 border border-amber-500/30 relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Architecture B — Amazon EventBridge
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {ebCount} events | avg {ebAvgLatency}ms
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 text-xs">
              <div className="flex-1 w-full p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-slate-400 text-[10px] uppercase font-mono">Event Bus</div>
                <div className="font-medium text-slate-200">EventBridge Bus</div>
                <div className="text-[10px] text-amber-400">Decoupled Broker</div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400 shrink-0 rotate-90 sm:rotate-0" />
              <div className="flex-1 w-full p-2.5 rounded-lg bg-slate-900/80 border border-amber-500/40 text-center">
                <div className="text-slate-400 text-[10px] uppercase font-mono">Pattern Matching</div>
                <div className="font-medium text-slate-200">Rules & Routing</div>
                <div className="text-[10px] text-slate-400">prefix/invoices, reports</div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400 shrink-0 rotate-90 sm:rotate-0" />
              <div className="flex-1 w-full p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-slate-400 text-[10px] uppercase font-mono">Target Compute</div>
                <div className="font-medium text-slate-200">Lambda B</div>
                <div className="text-[10px] text-emerald-400">Identical Workload</div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Characteristic: Loosely coupled, JSON filtering</span>
              <span className="text-amber-400">Multi-target fan-out</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
