import axios from 'axios';
import {
  FileRecord,
  EventRecord,
  TimelineItem,
  RuleRecord,
  ExperimentRecord,
  AnalyticsSummary,
  LatencyMetrics,
  ErrorAnalytics,
  ComparisonData,
  SystemHealth
} from '../types';

const API_BASE = '/api';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

export const api = {
  // Files
  getFiles: (params?: { search?: string; status?: string; prefix?: string }) =>
    client.get<FileRecord[]>('/files', { params }).then(r => r.data),

  getFileById: (id: string) =>
    client.get<FileRecord>(`/files/${id}`).then(r => r.data),

  uploadFile: (file: File, prefix?: string, mechanism?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (prefix) formData.append('prefix', prefix);
    if (mechanism) formData.append('mechanism', mechanism);
    return client.post<FileRecord>('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  validateFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return client.post('/files/validate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  checkDuplicate: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return client.post('/files/check-duplicate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  deleteFile: (id: string) =>
    client.delete(`/files/${id}`).then(r => r.data),

  // Events
  getEvents: (params?: { mechanism?: string; status?: string; eventType?: string; search?: string }) =>
    client.get<EventRecord[]>('/events', { params }).then(r => r.data),

  getEventById: (id: string) =>
    client.get<EventRecord>(`/events/${id}`).then(r => r.data),

  getEventTimeline: (id: string) =>
    client.get<TimelineItem[]>(`/events/${id}/timeline`).then(r => r.data),

  retryEvent: (id: string) =>
    client.post<EventRecord>(`/events/${id}/retry`).then(r => r.data),

  replayEvent: (id: string) =>
    client.post<EventRecord>(`/events/${id}/replay`).then(r => r.data),

  // Rules
  getRules: () =>
    client.get<RuleRecord[]>('/rules').then(r => r.data),

  createRule: (rule: Partial<RuleRecord>) =>
    client.post<RuleRecord>('/rules', rule).then(r => r.data),

  updateRule: (id: string, rule: Partial<RuleRecord>) =>
    client.put<RuleRecord>(`/rules/${id}`, rule).then(r => r.data),

  deleteRule: (id: string) =>
    client.delete(`/rules/${id}`).then(r => r.data),

  // Analytics
  getAnalyticsSummary: () =>
    client.get<AnalyticsSummary>('/analytics/summary').then(r => r.data),

  getLatencyMetrics: (architecture?: string) =>
    client.get<LatencyMetrics>('/analytics/latency', { params: { architecture } }).then(r => r.data),

  getErrorAnalytics: () =>
    client.get<ErrorAnalytics>('/analytics/errors').then(r => r.data),

  // Comparison
  getComparison: () =>
    client.get<ComparisonData>('/comparison').then(r => r.data),

  // Experiments
  getExperiments: () =>
    client.get<ExperimentRecord[]>('/experiments').then(r => r.data),

  createExperiment: (data: { name: string; architecture: string; eventCount: number; notes?: string }) =>
    client.post<ExperimentRecord>('/experiments', data).then(r => r.data),

  runExperiment: (id: string) =>
    client.post<ExperimentRecord>(`/experiments/${id}/run`).then(r => r.data),

  // System
  getSystemHealth: () =>
    client.get<SystemHealth>('/system/health').then(r => r.data),
};
