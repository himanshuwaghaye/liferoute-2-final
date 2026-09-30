import bcrypt from "bcryptjs";
import { mongoStore } from "./mongoStore.js";
import type { IUser } from "../models/User.js";

export interface DBUser {
  id: string;
  email: string;
  passwordHash: string;
  role:
    | "PATIENT"
    | "FAMILY_MEMBER"
    | "AMBULANCE_DRIVER"
    | "PARAMEDIC"
    | "HOSPITAL_STAFF"
    | "DOCTOR"
    | "ADMIN";
  phone: string;
  fullName: string;
  bloodGroup: string;
  age: number;
  language: string;
  allergies: string[];
  medications: string[];
  conditions: string[];
  emergencyContacts: { name: string; relation: string; phone: string }[];
  loginCount?: number;
  lastLoginAt?: string;
}

export interface DBAmbulance {
  id: string;
  code: string;
  type: "Advanced Life Support" | "Basic Life Support" | "Patient Transport";
  latitude: number;
  longitude: number;
  distanceKm: number;
  etaMinutes: number;
  driverAvailable: boolean;
  paramedicAvailable: boolean;
  driverName: string;
  driverPhone: string;
}

export interface DBHospital {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  etaMinutes: number;
  phone: string;
  emergencyDepartment: boolean;
  services: string[];
  specialist: string;
  icuBeds: number;
  traumaBeds: number;
  generalBeds: number;
}

export interface DBEmergencyRequest {
  id: string;
  referenceCode: string;
  patientId: string;
  patientName: string;
  category: string;
  subtype: string;
  symptoms: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  address: string;
  status:
    | "REQUESTED"
    | "MATCHING"
    | "AMBULANCE_ASSIGNED"
    | "DRIVER_ACCEPTED"
    | "EN_ROUTE"
    | "ARRIVED"
    | "PATIENT_PICKED_UP"
    | "AT_HOSPITAL"
    | "COMPLETED"
    | "CANCELLED";
  assignedAmbulanceId?: string;
  assignedHospitalId?: string;
  vitals?: { hr: number; spo2: number; bp: string; gcs: number; notes: string };
  createdAt: string;
  updatedAt: string;
}

export interface DBMedicalRecord {
  id: string;
  userId: string;
  title: string;
  section: string;
  provider: string;
  date: string;
  status: "Final" | "Pending" | "Shared";
}

export interface DBBill {
  id: string;
  userId: string;
  hospital: string;
  category: string;
  amount: number;
  date: string;
  paid: boolean;
}

export interface DBPayment {
  id: string;
  userId: string;
  hospital: string;
  amount: number;
  date: string;
  transactionId: string;
  method: string;
  status: "successful" | "pending" | "failed";
}

export interface DBNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  time: string;
  type: "ambulance" | "hospital" | "payment" | "record" | "system";
  read: boolean;
}

export interface DBAuditLog {
  id: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  timestamp: string;
}

class InMemoryDatabase {
  users: Map<string, DBUser> = new Map();
  ambulances: Map<string, DBAmbulance> = new Map();
  hospitals: Map<string, DBHospital> = new Map();
  emergencies: Map<string, DBEmergencyRequest> = new Map();
  medicalRecords: Map<string, DBMedicalRecord> = new Map();
  bills: Map<string, DBBill> = new Map();
  payments: Map<string, DBPayment> = new Map();
  notifications: Map<string, DBNotification> = new Map();
  auditLogs: DBAuditLog[] = [];

  constructor() {
    this.loadFromMongoStore();
  }

  private loadFromMongoStore() {
    // Populate users from Mongo Store
    if (mongoStore.data.users && mongoStore.data.users.length > 0) {
      mongoStore.data.users.forEach((u) => {
        this.users.set(u._id, {
          id: u._id,
          email: u.email,
          passwordHash: u.passwordHash,
          role: u.role,
          phone: u.phone,
          fullName: u.fullName,
          bloodGroup: u.bloodGroup,
          age: u.age,
          language: u.language,
          allergies: u.allergies,
          medications: u.medications,
          conditions: u.conditions,
          emergencyContacts: u.emergencyContacts,
          loginCount: u.loginCount,
          lastLoginAt: u.lastLoginAt,
        });
      });
    }

    // Populate ambulances from Mongo Store
    if (mongoStore.data.ambulances && mongoStore.data.ambulances.length > 0) {
      mongoStore.data.ambulances.forEach((a) => {
        this.ambulances.set(a._id, {
          id: a._id,
          code: a.code,
          type: a.type,
          latitude: a.location.latitude,
          longitude: a.location.longitude,
          distanceKm: a.distanceKm,
          etaMinutes: a.etaMinutes,
          driverAvailable: a.driverAvailable,
          paramedicAvailable: a.paramedicAvailable,
          driverName: a.driverName,
          driverPhone: a.driverPhone,
        });
      });
    }

    // Populate hospitals from Mongo Store
    if (mongoStore.data.hospitals && mongoStore.data.hospitals.length > 0) {
      mongoStore.data.hospitals.forEach((h) => {
        this.hospitals.set(h._id, {
          id: h._id,
          name: h.name,
          latitude: h.location.latitude,
          longitude: h.location.longitude,
          distanceKm: h.distanceKm,
          etaMinutes: h.etaMinutes,
          phone: h.phone,
          emergencyDepartment: h.emergencyDepartment,
          services: h.services,
          specialist: h.specialist,
          icuBeds: h.beds.icu,
          traumaBeds: h.beds.trauma,
          generalBeds: h.beds.general,
        });
      });
    }

    // Populate records
    if (mongoStore.data.medical_records && mongoStore.data.medical_records.length > 0) {
      mongoStore.data.medical_records.forEach((r) => {
        this.medicalRecords.set(r._id, {
          id: r._id,
          userId: r.userId,
          title: r.title,
          section: r.section,
          provider: r.provider,
          date: r.date,
          status: r.status,
        });
      });
    }

    // Populate bills & payments
    if (mongoStore.data.bills && mongoStore.data.bills.length > 0) {
      mongoStore.data.bills.forEach((b) => {
        this.bills.set(b._id, {
          id: b._id,
          userId: b.userId,
          hospital: b.hospital,
          category: b.category,
          amount: b.amount,
          date: b.date,
          paid: b.paid,
        });
      });
    }

    if (mongoStore.data.payments && mongoStore.data.payments.length > 0) {
      mongoStore.data.payments.forEach((p) => {
        this.payments.set(p._id, {
          id: p._id,
          userId: p.userId,
          hospital: p.hospital,
          amount: p.amount,
          date: p.date,
          transactionId: p.transactionId,
          method: p.method,
          status: p.status,
        });
      });
    }

    // Populate audit logs
    if (mongoStore.data.audit_logs && mongoStore.data.audit_logs.length > 0) {
      this.auditLogs = mongoStore.data.audit_logs.map((al) => ({
        id: al._id,
        userId: al.userId,
        action: al.action,
        resourceType: al.resourceType,
        resourceId: al.resourceId,
        details: al.details,
        ipAddress: al.ipAddress,
        timestamp: al.timestamp,
      }));
    }

    // Seed default notifications
    const defaultNotifs: DBNotification[] = [
      {
        id: "n-1",
        userId: "usr-patient-1",
        title: "Ambulance LR-102 assigned",
        body: "Advanced Life Support unit is on the way. ETA 4 minutes.",
        time: "2 min ago",
        type: "ambulance",
        read: false,
      },
      {
        id: "n-2",
        userId: "usr-patient-1",
        title: "Hospital alert acknowledged",
        body: "Sunrise Multispeciality emergency team is preparing.",
        time: "3 min ago",
        type: "hospital",
        read: false,
      },
      {
        id: "n-3",
        userId: "usr-patient-1",
        title: "Payment successful",
        body: "₹2,450 paid to Sunrise Multispeciality.",
        time: "Yesterday",
        type: "payment",
        read: true,
      },
    ];
    defaultNotifs.forEach((n) => this.notifications.set(n.id, n));
  }

  public syncMongo() {
    // Synchronize users
    mongoStore.data.users = Array.from(this.users.values()).map((u) => ({
      _id: u.id,
      email: u.email,
      passwordHash: u.passwordHash,
      role: u.role,
      fullName: u.fullName,
      phone: u.phone,
      bloodGroup: u.bloodGroup,
      age: u.age,
      language: u.language,
      allergies: u.allergies,
      medications: u.medications,
      conditions: u.conditions,
      emergencyContacts: u.emergencyContacts,
      loginCount: u.loginCount || 1,
      lastLoginAt: u.lastLoginAt || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // Synchronize emergencies
    mongoStore.data.emergency_requests = Array.from(this.emergencies.values()).map((e) => ({
      _id: e.id,
      referenceCode: e.referenceCode,
      patientId: e.patientId,
      patientName: e.patientName,
      category: e.category,
      subtype: e.subtype,
      symptoms: e.symptoms,
      imageUrl: e.imageUrl,
      location: {
        latitude: e.latitude,
        longitude: e.longitude,
        address: e.address,
      },
      status: e.status,
      assignedAmbulanceId: e.assignedAmbulanceId,
      assignedHospitalId: e.assignedHospitalId,
      vitals: e.vitals,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    }));

    // Synchronize records
    mongoStore.data.medical_records = Array.from(this.medicalRecords.values()).map((r) => ({
      _id: r.id,
      userId: r.userId,
      title: r.title,
      section: r.section,
      provider: r.provider,
      date: r.date,
      status: r.status,
      createdAt: new Date().toISOString(),
    }));

    // Synchronize payments
    mongoStore.data.payments = Array.from(this.payments.values()).map((p) => ({
      _id: p.id,
      userId: p.userId,
      hospital: p.hospital,
      amount: p.amount,
      date: p.date,
      transactionId: p.transactionId,
      method: p.method,
      status: p.status,
      createdAt: new Date().toISOString(),
    }));

    // Synchronize audit logs
    mongoStore.data.audit_logs = this.auditLogs.map((a) => ({
      _id: a.id,
      userId: a.userId,
      action: a.action,
      resourceType: a.resourceType,
      resourceId: a.resourceId,
      details: a.details,
      ipAddress: a.ipAddress,
      timestamp: a.timestamp,
    }));

    mongoStore.save();
  }

  logAudit(entry: Omit<DBAuditLog, "id" | "timestamp">) {
    const audit: DBAuditLog = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.push(audit);
    if (this.auditLogs.length > 500) {
      this.auditLogs.shift();
    }
    this.syncMongo();
  }
}

export const db = new InMemoryDatabase();
