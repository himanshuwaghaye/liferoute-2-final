export interface IAuditLog {
  _id: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export const AuditLogSchema = {
  name: "AuditLog",
  collection: "audit_logs",
};
