export interface IMedicalRecord {
  _id: string;
  userId: string;
  title: string;
  section: string;
  provider: string;
  documentUrl?: string;
  date: string;
  status: "Final" | "Pending" | "Shared";
  createdAt: string;
}

export const MedicalRecordSchema = {
  name: "MedicalRecord",
  collection: "medical_records",
};
