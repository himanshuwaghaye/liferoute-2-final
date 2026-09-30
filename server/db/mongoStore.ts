import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import type { IUser } from "../models/User.js";
import type { IEmergencyRequest } from "../models/EmergencyRequest.js";
import type { IAmbulance } from "../models/Ambulance.js";
import type { IHospital } from "../models/Hospital.js";
import type { IMedicalRecord } from "../models/MedicalRecord.js";
import type { IPayment, IBill } from "../models/Payment.js";
import type { IAuditLog } from "../models/AuditLog.js";

export interface DBCollections {
  users: IUser[];
  emergency_requests: IEmergencyRequest[];
  ambulances: IAmbulance[];
  hospitals: IHospital[];
  medical_records: IMedicalRecord[];
  payments: IPayment[];
  bills: IBill[];
  audit_logs: IAuditLog[];
}

const DATA_DIR = path.resolve(process.cwd(), "server", "data");
const DB_FILE = path.resolve(DATA_DIR, "db.json");

export class MongoDocumentStore {
  public data: DBCollections = {
    users: [],
    emergency_requests: [],
    ambulances: [],
    hospitals: [],
    medical_records: [],
    payments: [],
    bills: [],
    audit_logs: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(raw);
      } else {
        this.seedInitialDocuments();
        this.save();
      }
    } catch (err) {
      console.warn("[MongoStore] Loading failed, initializing with seed data:", err);
      this.seedInitialDocuments();
      this.save();
    }
  }

  public save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("[MongoStore] Failed to write database to disk:", err);
    }
  }

  private seedInitialDocuments() {
    const passwordHash = bcrypt.hashSync("LifeRoute@2026", 10);

    // 1. Users
    this.data.users = [
      {
        _id: "usr-patient-1",
        email: "patient@liferoute.com",
        passwordHash,
        role: "PATIENT",
        fullName: "Ishant Arun",
        phone: "+91 90000 00000",
        bloodGroup: "O+",
        age: 24,
        language: "English",
        allergies: ["Penicillin", "Dust mite"],
        medications: ["Salbutamol inhaler"],
        conditions: ["Mild asthma"],
        emergencyContacts: [
          { name: "Arun Kumar", relation: "Father", phone: "+91 90000 00001" },
          { name: "Meera Arun", relation: "Mother", phone: "+91 90000 00002" },
        ],
        loginCount: 5,
        lastLoginAt: new Date().toISOString(),
        createdAt: "2026-01-10T10:00:00.000Z",
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "usr-driver-1",
        email: "driver@liferoute.com",
        passwordHash,
        role: "AMBULANCE_DRIVER",
        fullName: "Rajesh Verma",
        phone: "+91 91111 00001",
        bloodGroup: "B+",
        age: 35,
        language: "Hindi",
        allergies: [],
        medications: [],
        conditions: [],
        emergencyContacts: [],
        loginCount: 12,
        lastLoginAt: new Date().toISOString(),
        createdAt: "2026-01-12T10:00:00.000Z",
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "usr-paramedic-1",
        email: "paramedic@liferoute.com",
        passwordHash,
        role: "PARAMEDIC",
        fullName: "Suresh Patil",
        phone: "+91 91111 00002",
        bloodGroup: "A+",
        age: 30,
        language: "English",
        allergies: [],
        medications: [],
        conditions: [],
        emergencyContacts: [],
        loginCount: 8,
        createdAt: "2026-01-15T10:00:00.000Z",
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "usr-doctor-1",
        email: "doctor@liferoute.com",
        passwordHash,
        role: "DOCTOR",
        fullName: "Dr. Neha Sharma",
        phone: "+91 91111 00003",
        bloodGroup: "AB+",
        age: 42,
        language: "English",
        allergies: [],
        medications: [],
        conditions: [],
        emergencyContacts: [],
        loginCount: 19,
        createdAt: "2026-01-08T10:00:00.000Z",
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "usr-admin-1",
        email: "admin@liferoute.com",
        passwordHash,
        role: "ADMIN",
        fullName: "LifeRoute Admin",
        phone: "+91 99999 99999",
        bloodGroup: "O+",
        age: 38,
        language: "English",
        allergies: [],
        medications: [],
        conditions: [],
        emergencyContacts: [],
        loginCount: 42,
        createdAt: "2026-01-01T10:00:00.000Z",
        updatedAt: new Date().toISOString(),
      },
    ];

    // 2. Ambulances
    this.data.ambulances = [
      {
        _id: "amb-1",
        code: "LR-102",
        type: "Advanced Life Support",
        registrationNumber: "MH-01-AL-1020",
        location: { latitude: 19.081, longitude: 72.872, lastUpdatedAt: new Date().toISOString() },
        distanceKm: 1.2,
        etaMinutes: 4,
        driverAvailable: true,
        paramedicAvailable: true,
        driverName: "Rajesh Verma",
        driverPhone: "+91 91111 00001",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        _id: "amb-2",
        code: "LR-118",
        type: "Basic Life Support",
        registrationNumber: "MH-01-BL-1180",
        location: { latitude: 19.069, longitude: 72.885, lastUpdatedAt: new Date().toISOString() },
        distanceKm: 2.4,
        etaMinutes: 7,
        driverAvailable: true,
        paramedicAvailable: false,
        driverName: "Amit Shinde",
        driverPhone: "+91 91111 00004",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        _id: "amb-3",
        code: "LR-207",
        type: "Patient Transport",
        registrationNumber: "MH-01-PT-2070",
        location: { latitude: 19.089, longitude: 72.889, lastUpdatedAt: new Date().toISOString() },
        distanceKm: 3.8,
        etaMinutes: 11,
        driverAvailable: true,
        paramedicAvailable: true,
        driverName: "Vikram Jadhav",
        driverPhone: "+91 91111 00005",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ];

    // 3. Hospitals
    this.data.hospitals = [
      {
        _id: "hos-1",
        name: "Sunrise Multispeciality Hospital",
        address: "Marine Lines East, Mumbai",
        phone: "+91 22 4000 1100",
        location: { latitude: 19.084, longitude: 72.883 },
        distanceKm: 2.1,
        etaMinutes: 6,
        emergencyDepartment: true,
        services: ["Trauma care", "Cardiac ICU", "CT / MRI", "Blood bank"],
        specialist: "Cardiology & Emergency",
        beds: { icu: 6, trauma: 4, general: 45 },
        isActive: true,
      },
      {
        _id: "hos-2",
        name: "City General Hospital",
        address: "Opp. Central Terminus, Mumbai",
        phone: "+91 22 4000 2200",
        location: { latitude: 19.07, longitude: 72.869 },
        distanceKm: 3.4,
        etaMinutes: 9,
        emergencyDepartment: true,
        services: ["Emergency ward", "Orthopaedics", "X-ray"],
        specialist: "Trauma surgery",
        beds: { icu: 3, trauma: 2, general: 30 },
        isActive: true,
      },
      {
        _id: "hos-3",
        name: "Lakeside Neuro Institute",
        address: "Lakeside Boulevard, Mumbai",
        phone: "+91 22 4000 3300",
        location: { latitude: 19.096, longitude: 72.861 },
        distanceKm: 5.6,
        etaMinutes: 14,
        emergencyDepartment: true,
        services: ["Stroke unit", "Neuro ICU", "Neurosurgery"],
        specialist: "Neurology",
        beds: { icu: 5, trauma: 3, general: 25 },
        isActive: true,
      },
    ];

    // 4. Medical Records
    this.data.medical_records = [
      {
        _id: "rec-1",
        userId: "usr-patient-1",
        title: "Complete blood count",
        section: "Lab Reports",
        date: "2026-08-14",
        provider: "Sunrise Multispeciality",
        status: "Final",
        createdAt: "2026-08-14T00:00:00.000Z",
      },
      {
        _id: "rec-2",
        userId: "usr-patient-1",
        title: "Chest X-ray",
        section: "Medical Images",
        date: "2026-07-02",
        provider: "City General Hospital",
        status: "Final",
        createdAt: "2026-07-02T00:00:00.000Z",
      },
      {
        _id: "rec-3",
        userId: "usr-patient-1",
        title: "Asthma management plan",
        section: "Medical History",
        date: "2026-05-20",
        provider: "Dr. N. Bhatia",
        status: "Shared",
        createdAt: "2026-05-20T00:00:00.000Z",
      },
      {
        _id: "rec-4",
        userId: "usr-patient-1",
        title: "Penicillin allergy note",
        section: "Allergies",
        date: "2025-11-11",
        provider: "Dr. N. Bhatia",
        status: "Final",
        createdAt: "2025-11-11T00:00:00.000Z",
      },
      {
        _id: "rec-5",
        userId: "usr-patient-1",
        title: "Salbutamol inhaler",
        section: "Prescriptions",
        date: "2026-05-20",
        provider: "Dr. N. Bhatia",
        status: "Final",
        createdAt: "2026-05-20T00:00:00.000Z",
      },
    ];

    // 5. Bills & Payments
    this.data.bills = [
      {
        _id: "bill-1",
        userId: "usr-patient-1",
        hospital: "Sunrise Multispeciality",
        category: "Emergency care",
        amount: 2450,
        date: "2026-08-14",
        paid: true,
      },
      {
        _id: "bill-2",
        userId: "usr-patient-1",
        hospital: "City General Hospital",
        category: "Consultation",
        amount: 890,
        date: "2026-07-02",
        paid: true,
      },
      {
        _id: "bill-3",
        userId: "usr-patient-1",
        hospital: "Lakeside Neuro Institute",
        category: "Tests",
        amount: 5300,
        date: "2026-06-21",
        paid: false,
      },
      {
        _id: "bill-4",
        userId: "usr-patient-1",
        hospital: "Sunrise Pharmacy",
        category: "Pharmacy",
        amount: 640,
        date: "2026-06-02",
        paid: false,
      },
    ];

    this.data.payments = [
      {
        _id: "pay-1",
        userId: "usr-patient-1",
        hospital: "Sunrise Multispeciality",
        amount: 2450,
        date: "2026-08-14",
        transactionId: "LR9F2K81QA",
        method: "UPI",
        status: "successful",
        receiptNumber: "LR-REC-2026-8819",
        createdAt: "2026-08-14T00:00:00.000Z",
      },
      {
        _id: "pay-2",
        userId: "usr-patient-1",
        hospital: "City General Hospital",
        amount: 890,
        date: "2026-07-02",
        transactionId: "LR4T7P19ZB",
        method: "Card",
        status: "successful",
        receiptNumber: "LR-REC-2026-8820",
        createdAt: "2026-07-02T00:00:00.000Z",
      },
    ];

    // 6. Audit Logs
    this.data.audit_logs = [
      {
        _id: "aud-1",
        userId: "usr-patient-1",
        action: "DATABASE_INITIALIZED",
        resourceType: "SYSTEM",
        details: { engine: "MongoDB Document Schema" },
        timestamp: new Date().toISOString(),
      },
    ];
  }
}

export const mongoStore = new MongoDocumentStore();
