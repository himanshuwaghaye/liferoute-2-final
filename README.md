# LifeRoute — Emergency Healthcare Coordination Platform

> **Faster Care. Safer Lives.**
> A production-ready, full-stack emergency healthcare coordination platform connecting patients, family members, ambulance drivers, paramedics, emergency hospital departments, and on-call physicians in real time.

---

## 🌟 Key Platform Features

1. **4-Step Guided Emergency SOS Flow**
   - Live continuous GPS geolocation with fallback manual coordinates.
   - Clinical category selection (Cardiac, Neurological, Respiratory, Trauma, Accidents).
   - Voice symptom transcription and photo capture attachments.
   - Proximity-based ambulance matching with Haversine distance and real-time ETA.

2. **Real-Time Live Map & Fleet Tracking**
   - Synchronized markers for Patient, Ambulance, and Receiving Hospital.
   - Authenticated WebSocket streams (`/api/realtime`) broadcasting continuous GPS coordinates and 8-stage emergency status transitions.

3. **Server-Side Groq AI Triage & Vision Analysis**
   - Zero client-side API key leakage — all queries execute server-side via `GROQ_API_KEY`.
   - Structured triage JSON output: Clinical Category, Urgency (Low / Moderate / High / Critical), Warning Signs, Suggested Department, Specialist Recommendation.
   - Image triage analysis for trauma, burns, and visible injuries.
   - Strict medical safety protocols prioritizing immediate professional care.

4. **Multi-Role Command Centers (Role-Based Access Control)**
   - **Patient / Family:** Trigger SOS, track assigned ambulance, manage ICE contacts, view medical history.
   - **Ambulance Driver:** Online/Offline availability switch, trip dispatch acceptance, GPS broadcasting, progress updates.
   - **Paramedic:** En-route vitals logger (HR, SpO2, BP, GCS) streaming live to the receiving emergency department.
   - **Hospital ER Staff:** Live incoming ambulance radar, emergency Amber alert acknowledgement, ICU/Trauma bed allocation.
   - **Doctor:** Emergency case review, clinical handoff, tele-consultation, availability management.
   - **Admin:** System telemetry, network response times, and immutable security audit logs.

5. **Encrypted Medical Records Vault**
   - Personal health record management (Lab Reports, Imaging, Prescriptions, Allergies).
   - Automatic attachment of allergy and active medication profiles to emergency dispatches.
   - ABDM / HIPAA aligned security audit logging.

6. **Cashless Healthcare Billing & UPI Payments**
   - Itemized emergency hospital billing and GST tax invoices.
   - Instant UPI QR scanner and transaction settlement verification.
   - Downloadable and printable receipts.

7. **Mobile App Support (PWA & Capacitor)**
   - PWA manifest (`/manifest.json`) supporting offline-first and home screen install.
   - Capacitor configuration (`capacitor.config.json`) ready for Android & iOS native builds with native Geolocation, Camera, and Push Notifications permissions.

---

## 🛠️ Technology Stack

| Layer                       | Technology                                                                          |
| --------------------------- | ----------------------------------------------------------------------------------- |
| **Frontend**                | React 19, TypeScript, TanStack Start, TanStack Router, TanStack Query               |
| **Styling & Design System** | TailwindCSS v4 with OKLCH semantic tokens, Radix UI, Lucide Icons                   |
| **Backend API**             | Node.js, Express, TypeScript, WebSocket (`ws`)                                      |
| **Database**                | Normalized PostgreSQL (`server/db/schema.sql`) + High-Performance Persistence Layer |
| **Security & Auth**         | JWT sessions, bcryptjs password hashing, server-side RBAC                           |
| **AI Engine**               | Groq API (`llama-3.3-70b-versatile` / `mixtral-8x7b-32768`)                         |
| **Testing**                 | Vitest unit and integration test suite                                              |
| **Mobile Runtime**          | Capacitor & Progressive Web App (PWA)                                               |

---

## 🚀 Quick Start & Installation

### 1. Prerequisites

- Node.js 18+ or 20+
- npm (or bun)

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in any custom credentials:

```bash
cp .env.example .env
```

| Variable            | Description                        | Default / Example                                               |
| ------------------- | ---------------------------------- | --------------------------------------------------------------- |
| `PORT`              | Backend server port                | `3001`                                                          |
| `DATABASE_URL`      | PostgreSQL connection string       | `postgresql://postgres:postgres@localhost:5432/liferoute`       |
| `JWT_SECRET`        | Secret key for JWT signing         | `liferoute-super-secure-production-jwt-secret-key-2026`         |
| `GROQ_API_KEY`      | Groq API key for AI symptom triage | _(Optional, uses deterministic clinical fallback when omitted)_ |
| `GROQ_MODEL`        | Groq model identifier              | `llama-3.3-70b-versatile`                                       |
| `VITE_API_BASE_URL` | API base URL for frontend          | `http://localhost:3001`                                         |

### 4. Run Development Servers

**Run Frontend UI:**

```bash
npm run dev
```

Accessible at **http://localhost:8080**

**Run Backend API & WebSocket Hub:**

```bash
npm run server
```

Accessible at **http://localhost:3001** (WebSocket at `ws://localhost:3001/api/realtime`)

---

## 🧪 Automated Testing & Code Quality

Run the test suite:

```bash
npm run test
```

Run TypeScript verification:

```bash
npx tsc --noEmit
```

Run code formatting & linting:

```bash
npm run format
npm run lint
```

---

## 📱 Mobile App Build (Android / iOS)

LifeRoute is configured with `@capacitor/core` and PWA support.

To build the native mobile bundle:

```bash
# 1. Build the production web bundle
npm run build

# 2. Add Android or iOS platform (if using Capacitor CLI)
npx cap add android
npx cap add ios

# 3. Synchronize web assets to native container
npx cap sync

# 4. Open in Android Studio / Xcode
npx cap open android
```

---

## 🔒 Security & Medical Data Privacy

- **RBAC Enforced Server-Side:** Frontend route guards are paired with server middleware (`requireRole`). Unauthorized role escalations trigger audit entries.
- **Audit Logging:** Access to medical records, status updates, and emergency triage notes are recorded in `audit_logs`.
- **Zero AI Data Retention:** Clinical prompts are processed in-memory via Groq server-side calls without persistent storage of sensitive queries.
- **Zero Plaintext Credentials:** Passwords are encrypted with `bcrypt` rounds.
