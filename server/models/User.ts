export interface IUser {
  _id: string;
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
  fullName: string;
  phone: string;
  bloodGroup: string;
  age: number;
  language: string;
  allergies: string[];
  medications: string[];
  conditions: string[];
  emergencyContacts: {
    name: string;
    relation: string;
    phone: string;
  }[];
  loginCount: number;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const UserSchema = {
  name: "User",
  collection: "users",
  fields: [
    "_id",
    "email",
    "passwordHash",
    "role",
    "fullName",
    "phone",
    "bloodGroup",
    "age",
    "language",
    "allergies",
    "medications",
    "conditions",
    "emergencyContacts",
    "loginCount",
    "lastLoginAt",
    "createdAt",
    "updatedAt",
  ],
};
