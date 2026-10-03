import React from 'react';
import { 
  Scale, 
  Check, 
  Minus, 
  Clock, 
  Zap, 
  Layers, 
  ShieldCheck, 
  GitFork,
  CheckCircle2,
  Info
} from 'lucide-react';
import { ComparisonData } from '../types';

interface Props {
  comparison: ComparisonData | null;
}

export const ComparisonTab: React.FC<Props> = ({ comparison }) => {
  const s3 = comparison?.s3Notification;
  const eb = comparison?.eventBridge;

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-amber-500 text-white">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Architectural Comparison — S3 Notifications vs Amazon EventBridge
            </h3>
            <p className="text-xs text-slate-400">
              Isolating event delivery and routing characteristics under equivalent business processing workloads
            </p>
          </div>
        </div>
      </div>

      {/* Side-by-Side Measured Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Architecture A: S3 Notification */}
        <div className="glass-panel rounded-2xl p-6 border border-cyan-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Architecture A
              </span>
              <h4 className="text-base font-bold text-slate-100 mt-2">
                Direct S3 Event Notification
              </h4>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Sample Size</div>
              <div className="text-sm font-semibold text-cyan-400 font-mono">{s3?.totalEvents ?? 0} events</div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Average Delivery Latency</span>
              <span className="font-mono font-semibold text-slate-100">{s3?.averageDeliveryLatency ?? 0}ms</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Average Processing Latency</span>
              <span className="font-mono font-semibold text-slate-100">{s3?.averageProcessingLatency ?? 0}ms</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">P95 Total Latency SLA</span>
              <span className="font-mono font-semibold text-cyan-400">{s3?.p95Latency ?? 0}ms</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Success Rate</span>
              <span className="font-mono font-semibold text-emerald-400">{s3?.successRate ?? 100}%</span>
            </div>
          </div>

          <div className="mt-5 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1.5">
            <div className="font-semibold text-slate-200">Core Strengths:</div>
            <div className="text-slate-400 flex items-start space-x-2">
              <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>Lowest possible delivery overhead (direct point-to-point push)</span>
            </div>
            <div className="text-slate-400 flex items-start space-x-2">
              <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>Simple, zero extra cost per event (no event bus pricing)</span>
            </div>
            <div className="text-slate-400 flex items-start space-x-2">
              <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>Ideal for simple single-destination workflows (e.g. 1 bucket → 1 Lambda)</span>
            </div>
          </div>
        </div>

        {/* Architecture B: EventBridge */}
        <div className="glass-panel rounded-2xl p-6 border border-amber-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Architecture B
              </span>
              <h4 className="text-base font-bold text-slate-100 mt-2">
                Amazon EventBridge Routing
              </h4>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Sample Size</div>
              <div className="text-sm font-semibold text-amber-400 font-mono">{eb?.totalEvents ?? 0} events</div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Average Delivery Latency</span>
              <span className="font-mono font-semibold text-slate-100">{eb?.averageDeliveryLatency ?? 0}ms</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Average Processing Latency</span>
              <span className="font-mono font-semibold text-slate-100">{eb?.averageProcessingLatency ?? 0}ms</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">P95 Total Latency SLA</span>
              <span className="font-mono font-semibold text-amber-400">{eb?.p95Latency ?? 0}ms</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Success Rate</span>
              <span className="font-mono font-semibold text-emerald-400">{eb?.successRate ?? 100}%</span>
            </div>
          </div>

          <div className="mt-5 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1.5">
            <div className="font-semibold text-slate-200">Core Strengths:</div>
            <div className="text-slate-400 flex items-start space-x-2">
              <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>Decoupled publisher/subscriber architecture with pattern-matching</span>
            </div>
            <div className="text-slate-400 flex items-start space-x-2">
              <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>Native fan-out to 20+ AWS targets without modifying S3 bucket config</span>
            </div>
            <div className="text-slate-400 flex items-start space-x-2">
              <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>Native event archiving and point-in-time replay support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Comparison Matrix */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <h4 className="text-sm font-semibold text-slate-100 mb-4">
          Architectural Capabilities Comparison Matrix
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3 px-3 w-1/4">Evaluation Dimension</th>
                <th className="pb-3 px-3 w-3/8 text-cyan-400">Architecture A: S3 Direct Notification</th>
                <th className="pb-3 px-3 w-3/8 text-amber-400">Architecture B: Amazon EventBridge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr>
                <td className="py-3.5 px-3 font-medium text-slate-200">Architectural Coupling</td>
                <td className="py-3.5 px-3 text-slate-300">
                  <span className="font-semibold text-slate-200">Tight Coupling:</span> S3 bucket configuration directly names destination Lambda/SQS/SNS ARN.
                </td>
                <td className="py-3.5 px-3 text-slate-300">
                  <span className="font-semibold text-slate-200">Loose Coupling:</span> S3 sends events to the event bus; consumers subscribe independently via rules.
                </td>
              </tr>

              <tr>
                <td className="py-3.5 px-3 font-medium text-slate-200">Delivery Latency Profile</td>
                <td className="py-3.5 px-3 text-slate-300">
                  ~20–50ms (direct point-to-point push, minimal intermediary overhead).
                </td>
                <td className="py-3.5 px-3 text-slate-300">
                  ~45–90ms (involves bus transport, pattern evaluation, and routing dispatch).
                </td>
              </tr>

              <tr>
                <td className="py-3.5 px-3 font-medium text-slate-200">Target Ecosystem</td>
                <td className="py-3.5 px-3 text-slate-300">
                  3 targets only: AWS Lambda, Amazon SNS, Amazon SQS.
                </td>
                <td className="py-3.5 px-3 text-slate-300">
                  20+ targets (Step Functions, Kinesis, ECS, CodePipeline, API Gateway, SNS, SQS, Lambda).
                </td>
              </tr>

              <tr>
                <td className="py-3.5 px-3 font-medium text-slate-200">Filtering & Matching</td>
                <td className="py-3.5 px-3 text-slate-300">
                  Prefix and suffix matching only. Overlapping prefixes across notifications are restricted.
                </td>
                <td className="py-3.5 px-3 text-slate-300">
                  Advanced JSON pattern matching: prefix, exact value, numeric range, wildcard, exists check.
                </td>
              </tr>

              <tr>
                <td className="py-3.5 px-3 font-medium text-slate-200">Fan-Out Support</td>
                <td className="py-3.5 px-3 text-slate-300">
                  Cannot fan-out without intermediate Amazon SNS topic.
                </td>
                <td className="py-3.5 px-3 text-slate-300">
                  Native fan-out up to 5 targets per rule; multiple rules can listen to the exact same event.
                </td>
              </tr>

              <tr>
                <td className="py-3.5 px-3 font-medium text-slate-200">Replay & Audit</td>
                <td className="py-3.5 px-3 text-slate-300">
                  No native event archive or historical replay mechanism.
                </td>
                <td className="py-3.5 px-3 text-slate-300">
                  Native EventBridge Event Archive with point-in-time replay into the bus.
                </td>
              </tr>

              <tr>
                <td className="py-3.5 px-3 font-medium text-slate-200">Cost Structure</td>
                <td className="py-3.5 px-3 text-slate-300">
                  Free (no charge for S3 Event Notifications itself, only target compute).
                </td>
                <td className="py-3.5 px-3 text-slate-300">
                  Free ingestion for AWS service events on the default bus; $1.00/million for custom bus events.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Balanced Summary Banner */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start space-x-3">
        <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">Engineering Recommendation: </span>
          Choose <strong>S3 Event Notifications</strong> when you have a singular dedicated consumer where minimum latency and simplicity are primary. Choose <strong>Amazon EventBridge</strong> when building enterprise event-driven architectures requiring dynamic routing, multi-consumer fan-out, content filtering, or cross-account/cross-region event dispatch.
        </div>
      </div>
    </div>
  );
};
