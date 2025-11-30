export interface AuditLogEntry {
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  message: string;
  context: Record<string, any>;
}