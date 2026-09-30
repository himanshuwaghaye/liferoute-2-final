/**
 * DEMO DATA — development mocks only.
 * Never presented in the UI as live real-world data; screens that read from
 * here render a "DEMO DATA" badge.
 */
import type {
  ActivityItem,
  Ambulance,
  AppNotification,
  Bill,
  Hospital,
  MedicalRecord,
  Payment,
} from "@/types";

export const DEMO_USER = {
  name: "Ishant",
  fullName: "Ishant Arun",
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
};

export const DEMO_CENTER = { lat: 19.076, lng: 72.8777 };

export const DEMO_AMBULANCES: Ambulance[] = [
  {
    id: "amb-1",
    code: "LR-102",
    type: "Advanced Life Support",
    distanceKm: 1.2,
    etaMinutes: 4,
    driverAvailable: true,
    paramedicAvailable: true,
    position: { lat: 19.081, lng: 72.872 },
  },
  {
    id: "amb-2",
    code: "LR-118",
    type: "Basic Life Support",
    distanceKm: 2.4,
    etaMinutes: 7,
    driverAvailable: true,
    paramedicAvailable: false,
    position: { lat: 19.069, lng: 72.885 },
  },
  {
    id: "amb-3",
    code: "LR-207",
    type: "Patient Transport",
    distanceKm: 3.8,
    etaMinutes: 11,
    driverAvailable: true,
    paramedicAvailable: true,
    position: { lat: 19.089, lng: 72.889 },
  },
];

export const DEMO_HOSPITALS: Hospital[] = [
  {
    id: "hos-1",
    name: "Sunrise Multispeciality Hospital",
    distanceKm: 2.1,
    etaMinutes: 6,
    emergencyDepartment: true,
    services: ["Trauma care", "Cardiac ICU", "CT / MRI", "Blood bank"],
    specialist: "Cardiology",
    phone: "+91 22 4000 1100",
    position: { lat: 19.084, lng: 72.883 },
  },
  {
    id: "hos-2",
    name: "City General Hospital",
    distanceKm: 3.4,
    etaMinutes: 9,
    emergencyDepartment: true,
    services: ["Emergency ward", "Orthopaedics", "X-ray"],
    specialist: "Trauma surgery",
    phone: "+91 22 4000 2200",
    position: { lat: 19.07, lng: 72.869 },
  },
  {
    id: "hos-3",
    name: "Lakeside Neuro Institute",
    distanceKm: 5.6,
    etaMinutes: 14,
    emergencyDepartment: true,
    services: ["Stroke unit", "Neuro ICU", "Neurosurgery"],
    specialist: "Neurology",
    phone: "+91 22 4000 3300",
    position: { lat: 19.096, lng: 72.861 },
  },
];

export const DEMO_RECORDS: MedicalRecord[] = [
  {
    id: "rec-1",
    title: "Complete blood count",
    section: "Lab Reports",
    date: "2026-08-14",
    provider: "Sunrise Multispeciality",
    status: "Final",
  },
  {
    id: "rec-2",
    title: "Chest X-ray",
    section: "Medical Images",
    date: "2026-07-02",
    provider: "City General Hospital",
    status: "Final",
  },
  {
    id: "rec-3",
    title: "Asthma management plan",
    section: "Medical History",
    date: "2026-05-20",
    provider: "Dr. N. Bhatia",
    status: "Shared",
  },
  {
    id: "rec-4",
    title: "Penicillin allergy note",
    section: "Allergies",
    date: "2025-11-11",
    provider: "Dr. N. Bhatia",
    status: "Final",
  },
  {
    id: "rec-5",
    title: "Salbutamol inhaler",
    section: "Prescriptions",
    date: "2026-05-20",
    provider: "Dr. N. Bhatia",
    status: "Final",
  },
  {
    id: "rec-6",
    title: "Emergency visit — breathing difficulty",
    section: "Emergency History",
    date: "2026-02-08",
    provider: "City General Hospital",
    status: "Final",
  },
  {
    id: "rec-7",
    title: "Follow-up consultation summary",
    section: "Doctor Reports",
    date: "2026-03-01",
    provider: "Dr. S. Rao",
    status: "Pending",
  },
  {
    id: "rec-8",
    title: "Annual health check",
    section: "Hospital Visits",
    date: "2026-01-19",
    provider: "Sunrise Multispeciality",
    status: "Final",
  },
];

export const DEMO_PAYMENTS: Payment[] = [
  {
    id: "pay-1",
    hospital: "Sunrise Multispeciality",
    amount: 2450,
    date: "2026-08-14",
    transactionId: "LR9F2K81QA",
    method: "UPI",
    status: "successful",
  },
  {
    id: "pay-2",
    hospital: "City General Hospital",
    amount: 890,
    date: "2026-07-02",
    transactionId: "LR4T7P19ZB",
    method: "Card",
    status: "successful",
  },
  {
    id: "pay-3",
    hospital: "Lakeside Neuro Institute",
    amount: 5300,
    date: "2026-06-21",
    transactionId: "LR2C8M44XD",
    method: "Netbanking",
    status: "pending",
  },
  {
    id: "pay-4",
    hospital: "City General Hospital",
    amount: 1200,
    date: "2026-04-05",
    transactionId: "LR7Q1L63YH",
    method: "UPI",
    status: "failed",
  },
];

export const DEMO_BILLS: Bill[] = [
  {
    id: "bill-1",
    hospital: "Sunrise Multispeciality",
    category: "Emergency care",
    amount: 2450,
    date: "2026-08-14",
    paid: true,
  },
  {
    id: "bill-2",
    hospital: "City General Hospital",
    category: "Consultation",
    amount: 890,
    date: "2026-07-02",
    paid: true,
  },
  {
    id: "bill-3",
    hospital: "Lakeside Neuro Institute",
    category: "Tests",
    amount: 5300,
    date: "2026-06-21",
    paid: false,
  },
  {
    id: "bill-4",
    hospital: "Sunrise Pharmacy",
    category: "Pharmacy",
    amount: 640,
    date: "2026-06-02",
    paid: false,
  },
];

export const DEMO_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n-1",
    title: "Ambulance LR-102 assigned",
    body: "Advanced Life Support unit is on the way. ETA 4 minutes.",
    time: "2 min ago",
    type: "ambulance",
    read: false,
  },
  {
    id: "n-2",
    title: "Hospital alert acknowledged",
    body: "Sunrise Multispeciality emergency team is preparing.",
    time: "3 min ago",
    type: "hospital",
    read: false,
  },
  {
    id: "n-3",
    title: "Payment successful",
    body: "₹2,450 paid to Sunrise Multispeciality.",
    time: "Yesterday",
    type: "payment",
    read: true,
  },
  {
    id: "n-4",
    title: "Medical record uploaded",
    body: "Chest X-ray added to your records.",
    time: "2 days ago",
    type: "record",
    read: true,
  },
];

export const DEMO_ACTIVITY: ActivityItem[] = [
  { id: "a-1", label: "Ambulance LR-102 assigned", time: "2 min ago" },
  { id: "a-2", label: "Hospital alert sent to Sunrise Multispeciality", time: "3 min ago" },
  { id: "a-3", label: "Health assessment completed", time: "Yesterday" },
  { id: "a-4", label: "Medical record uploaded", time: "2 days ago" },
  { id: "a-5", label: "Payment successful — ₹2,450", time: "2 days ago" },
];
