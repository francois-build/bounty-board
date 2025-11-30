export interface AuditLogEntry {
    event: string;
    uid: string;
    timestamp: number;
    details: string;
    [key: string]: any; 
}