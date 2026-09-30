-- LifeRoute Normalized PostgreSQL Database Schema
-- HIPAA / ABDM Compliant Emergency Healthcare Platform

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM (
    'PATIENT',
    'FAMILY_MEMBER',
    'AMBULANCE_DRIVER',
    'PARAMEDIC',
    'HOSPITAL_STAFF',
    'DOCTOR',
    'ADMIN'
);

CREATE TYPE emergency_status AS ENUM (
    'REQUESTED',
    'MATCHING',
    'AMBULANCE_ASSIGNED',
    'DRIVER_ACCEPTED',
    'EN_ROUTE',
    'ARRIVED',
    'PATIENT_PICKED_UP',
    'AT_HOSPITAL',
    'COMPLETED',
    'CANCELLED'
);

CREATE TYPE ambulance_type AS ENUM (
    'Advanced Life Support',
    'Basic Life Support',
    'Patient Transport'
);

CREATE TYPE payment_status AS ENUM (
    'pending',
    'authorized',
    'successful',
    'failed',
    'refunded'
);

CREATE TYPE urgency_level AS ENUM (
    'Low',
    'Moderate',
    'High',
    'Critical'
);

-- 3. USERS & PROFILES
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'PATIENT',
    phone VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    age INT,
    blood_group VARCHAR(10),
    language VARCHAR(50) DEFAULT 'English',
    abha_id VARCHAR(50),
    allergies JSONB DEFAULT '[]'::jsonb,
    medications JSONB DEFAULT '[]'::jsonb,
    conditions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    relation VARCHAR(50) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. HOSPITALS & DEPARTMENTS
CREATE TABLE IF NOT EXISTS hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    has_emergency_dept BOOLEAN DEFAULT TRUE,
    services JSONB DEFAULT '[]'::jsonb,
    specialist_field VARCHAR(100),
    icu_beds INT DEFAULT 10,
    trauma_beds INT DEFAULT 5,
    general_beds INT DEFAULT 50,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hospital_departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    head_doctor VARCHAR(150),
    phone VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    is_on_duty BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. AMBULANCES, DRIVERS & PARAMEDICS
CREATE TABLE IF NOT EXISTS ambulances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    type ambulance_type NOT NULL,
    registration_number VARCHAR(50) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    driver_available BOOLEAN DEFAULT TRUE,
    paramedic_available BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ambulance_drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ambulance_id UUID REFERENCES ambulances(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    license_number VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    is_online BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS paramedics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ambulance_id UUID REFERENCES ambulances(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    certification VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    is_online BOOLEAN DEFAULT TRUE
);

-- 6. EMERGENCY REQUESTS & ASSIGNMENTS
CREATE TABLE IF NOT EXISTS emergency_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_code VARCHAR(50) UNIQUE NOT NULL,
    patient_id UUID REFERENCES users(id) ON DELETE SET NULL,
    category VARCHAR(50) NOT NULL,
    subtype VARCHAR(100),
    symptoms TEXT,
    image_url TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT,
    status emergency_status NOT NULL DEFAULT 'REQUESTED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emergency_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    emergency_request_id UUID NOT NULL REFERENCES emergency_requests(id) ON DELETE CASCADE,
    ambulance_id UUID NOT NULL REFERENCES ambulances(id),
    hospital_id UUID NOT NULL REFERENCES hospitals(id),
    driver_id UUID REFERENCES ambulance_drivers(id),
    paramedic_id UUID REFERENCES paramedics(id),
    eta_minutes INT,
    distance_km DOUBLE PRECISION,
    vitals_log JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ambulance_location_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ambulance_id UUID NOT NULL REFERENCES ambulances(id) ON DELETE CASCADE,
    emergency_request_id UUID REFERENCES emergency_requests(id),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. MEDICAL RECORDS & AUDIT LOGS
CREATE TABLE IF NOT EXISTS patient_medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    section VARCHAR(100) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    document_url TEXT,
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'Final',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. AI ASSESSMENTS
CREATE TABLE IF NOT EXISTS ai_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    emergency_request_id UUID REFERENCES emergency_requests(id) ON DELETE SET NULL,
    symptoms TEXT NOT NULL,
    category VARCHAR(150) NOT NULL,
    urgency urgency_level NOT NULL,
    warning_signs JSONB NOT NULL DEFAULT '[]'::jsonb,
    suggested_department VARCHAR(100),
    suggested_specialist VARCHAR(100),
    confidence_level VARCHAR(50),
    model_version VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. BILLING & PAYMENTS
CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES hospitals(id),
    hospital_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    invoiced_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id UUID REFERENCES bills(id),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    hospital_name VARCHAR(255) NOT NULL,
    transaction_reference VARCHAR(100) UNIQUE NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status payment_status NOT NULL DEFAULT 'successful',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. INDEXES FOR HIGH-THROUGHPUT DISPATCH
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_emergency_status ON emergency_requests(status);
CREATE INDEX IF NOT EXISTS idx_ambulances_coords ON ambulances(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_hospitals_coords ON hospitals(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_med_records_user ON patient_medical_records(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
