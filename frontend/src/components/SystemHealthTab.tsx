import React from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Server, 
  Cloud, 
  Database, 
  GitBranch, 
  Activity, 
  ShieldCheck,
  Terminal,
  Key
} from 'lucide-react';
import { SystemHealth } from '../types';

interface Props {
  health: SystemHealth | null;
  onRefresh: () => void;
}

export const SystemHealthTab: React.FC<Props> = ({ health, onRefresh }) => {
  const services = health?.services || {};

  const getServiceIcon = (key: string) => {
    switch (key) {
      case 'backend': return Server;
      case 's3': return Cloud;
      case 'dynamodb': return Database;
      case 'eventbridge': return GitBranch;
      case 'cloudwatch': return Activity;
      default: return Cpu;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-semibold text-slate-100">
                  System Health & AWS Infrastructure Status
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                  health?.status === 'UP' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400'
                }`}>
                  STATUS: {health?.status || 'CHECKING'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time operational monitoring of Spring Boot API, Amazon S3, DynamoDB, EventBridge & CloudWatch
              </p>
            </div>
          </div>

          <button
            onClick={onRefresh}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recheck Services</span>
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(services).map(([key, svc]) => {
          const Icon = getServiceIcon(key);
          const isConnected = svc.status === 'CONNECTED';

          return (
            <div 
              key={key} 
              className="glass-card rounded-xl p-5 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-lg bg-slate-800 text-sky-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-sm capitalize text-slate-200">{key}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                    isConnected 
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  }`}>
                    {svc.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-2">
                  {svc.details}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Latency</span>
                <span>{svc.latencyMs} ms</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* AWS Learner Lab Credentials Config Box */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2 text-slate-200">
          <Key className="w-4 h-4 text-amber-400" />
          <h4 className="text-sm font-semibold">AWS Academy Learner Lab Environment Status</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-slate-400 text-[10px] uppercase font-mono">Region</div>
            <div className="font-semibold text-slate-200 mt-1 font-mono">{health?.aws.region || 'us-east-1'}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-slate-400 text-[10px] uppercase font-mono">S3 Bucket</div>
            <div className="font-semibold text-slate-200 mt-1 font-mono truncate">{health?.aws.bucket || 'eventflow-data'}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-slate-400 text-[10px] uppercase font-mono">Learner Lab Session Token</div>
            <div className={`font-semibold mt-1 ${health?.aws.sessionTokenPresent ? 'text-emerald-400' : 'text-amber-400'}`}>
              {health?.aws.sessionTokenPresent ? 'ACTIVE (Provided)' : 'PENDING'}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-slate-400 text-[10px] uppercase font-mono">Assumed IAM Role</div>
            <div className="font-semibold text-sky-400 mt-1 font-mono">LabRole</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            <span>How to Connect Your AWS Academy Learner Lab Account:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-300">
            <li>In your AWS Academy Learner Lab console, click <strong>AWS Details</strong> &rarr; <strong>Show</strong> under AWS CLI.</li>
            <li>Copy your <code className="text-amber-300">aws_access_key_id</code>, <code className="text-amber-300">aws_secret_access_key</code>, and <code className="text-amber-300">aws_session_token</code>.</li>
            <li>Paste them into your <code className="text-sky-300">.env</code> file in the project root directory.</li>
            <li>Restart backend or refresh this page. The system will automatically use the live AWS credentials!</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
