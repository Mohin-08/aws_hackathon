import React, { useState } from 'react';
import { 
  Upload, 
  Search, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  ShieldAlert, 
  Copy, 
  Filter, 
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { FileRecord } from '../types';
import { api } from '../services/api';

interface Props {
  files: FileRecord[];
  onRefresh: () => void;
  onSelectEventByFile?: (fileId: string) => void;
}

export const FilesTab: React.FC<Props> = ({ files, onRefresh }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [prefix, setPrefix] = useState<string>('uploads/invoices/');
  const [mechanism, setMechanism] = useState<string>('BOTH');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [prefixFilter, setPrefixFilter] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setUploadError(null);
      setUploadSuccess(null);

      // Auto-detect prefix
      const name = file.name.toLowerCase();
      if (name.includes('invoice') || name.includes('bill')) {
        setPrefix('uploads/invoices/');
      } else if (name.includes('report') || name.includes('statement')) {
        setPrefix('uploads/reports/');
      } else if (/\.(png|jpg|jpeg|webp)$/i.test(name)) {
        setPrefix('uploads/images/');
      }
    }
  };

  const handleUpload = async (fileToUpload?: File) => {
    const file = fileToUpload || selectedFile;
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const res = await api.uploadFile(file, prefix, mechanism);
      if (res.status === 'DUPLICATE') {
        setUploadSuccess(`Uploaded with warning: ${res.fileName} (Duplicate content detected: hash matches existing file)`);
      } else {
        setUploadSuccess(`Successfully uploaded ${res.fileName} to ${res.s3Key}`);
      }
      setSelectedFile(null);
      onRefresh();
    } catch (err: any) {
      setUploadError(err.response?.data?.error || err.message || 'File upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSimulateFailure = () => {
    // Generate a mock failure file as specified in Requirement 16
    const blob = new Blob(['Simulated corruption or invalid document payload for hackathon demo.'], { type: 'application/pdf' });
    const failureFile = new File([blob], 'failure-test-invoice.pdf', { type: 'application/pdf' });
    setSelectedFile(failureFile);
    setPrefix('uploads/invoices/');
    handleUpload(failureFile);
  };

  const handleDelete = async (fileId: string) => {
    if (confirm('Delete this file and remove its record?')) {
      try {
        await api.deleteFile(fileId);
        onRefresh();
      } catch (err: any) {
        alert('Delete failed: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const filteredFiles = files.filter(f => {
    const matchesSearch = !searchTerm || 
      f.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.s3Key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.hash.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || f.status === statusFilter;
    const matchesPrefix = !prefixFilter || (f.prefix && f.prefix.includes(prefixFilter));
    return matchesSearch && matchesStatus && matchesPrefix;
  });

  return (
    <div className="space-y-6">
      {/* Upload & Ingestion Box */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-100">File Ingestion & Validation Workflow</h3>
            <p className="text-xs text-slate-400">
              Validates MIME type, calculates SHA-256 hash, detects duplicates, and stores into S3 bucket prefixes
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSimulateFailure}
              disabled={isUploading}
              className="px-3 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-medium hover:bg-rose-500/25 flex items-center space-x-1.5 transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Trigger Controlled Failure Test</span>
            </button>
          </div>
        </div>

        {/* Upload Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* File Picker */}
          <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-900/50">
            <input 
              type="file" 
              id="file-upload" 
              className="hidden" 
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg,.json,.csv,.txt,.docx"
            />
            <label htmlFor="file-upload" className="cursor-pointer w-full flex flex-col items-center">
              <Upload className="w-7 h-7 text-sky-400 mb-2" />
              <span className="text-xs font-medium text-slate-200">
                {selectedFile ? selectedFile.name : 'Click to select or drop file'}
              </span>
              <span className="text-[10px] text-slate-500 mt-1">
                PDF, CSV, PNG, JSON, TXT (Max 25MB)
              </span>
            </label>
          </div>

          {/* S3 Prefix Routing */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
            <div>
              <label className="text-xs font-medium text-slate-300 flex items-center space-x-1.5 mb-1.5">
                <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>S3 Bucket Prefix (Routing Target)</span>
              </label>
              <select 
                value={prefix} 
                onChange={(e) => setPrefix(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="uploads/invoices/">uploads/invoices/ (Financial Rule)</option>
                <option value="uploads/reports/">uploads/reports/ (Analytics Rule)</option>
                <option value="uploads/images/">uploads/images/ (Media Rule)</option>
                <option value="uploads/general/">uploads/general/ (Default Rule)</option>
              </select>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Prefix determines the EventBridge rule matching & target routing
            </p>
          </div>

          {/* Target Architecture Mechanism */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Event Processing Mechanism
              </label>
              <select 
                value={mechanism} 
                onChange={(e) => setMechanism(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="BOTH">Both Architectures (Side-by-Side Comparison)</option>
                <option value="S3_NOTIFICATION">Architecture A Only (Direct S3 Notification)</option>
                <option value="EVENTBRIDGE">Architecture B Only (Amazon EventBridge)</option>
              </select>
            </div>
            <button
              onClick={() => handleUpload()}
              disabled={!selectedFile || isUploading}
              className="mt-3 w-full py-2 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-medium text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-sky-500/20 transition-all"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Ingesting & Processing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload & Ingest to S3</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback Alerts */}
        {uploadSuccess && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
        )}
        {uploadError && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Files Table & Filter Bar */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by filename, key, or SHA-256..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
            >
              <option value="">All Statuses</option>
              <option value="UPLOADED">UPLOADED</option>
              <option value="DUPLICATE">DUPLICATE</option>
              <option value="ERROR">ERROR</option>
            </select>

            <select
              value={prefixFilter}
              onChange={(e) => setPrefixFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
            >
              <option value="">All Prefixes</option>
              <option value="invoices">invoices/</option>
              <option value="reports">reports/</option>
              <option value="images">images/</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>Showing {filteredFiles.length} of {files.length} files</span>
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3 px-3">File Name</th>
                <th className="pb-3 px-3">Prefix / Key</th>
                <th className="pb-3 px-3">Size</th>
                <th className="pb-3 px-3">SHA-256 Hash</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Uploaded At</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No files found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr key={file.fileId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-200 flex items-center space-x-2">
                      <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>{file.fileName}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                      {file.s3Key}
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono">
                      {(file.fileSize / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-3 px-3 font-mono text-[10px] text-slate-400" title={file.hash}>
                      {file.hash ? `${file.hash.substring(0, 10)}...${file.hash.substring(file.hash.length - 6)}` : '—'}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                        file.status === 'DUPLICATE'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : file.status === 'ERROR'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {file.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {new Date(file.uploadedAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDelete(file.fileId)}
                        className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                        title="Delete file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
