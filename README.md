# GovScheme AI - Enterprise Platform

GovScheme AI is a modern, AI-powered Government Administration and Citizen Welfare Portal. It provides an enterprise-grade ecosystem for administrators to manage schemes, while offering rural households and citizens an accessible, multilingual, AI-driven interface to discover and apply for benefits.

## Features

### 🏢 Enterprise Admin Portal
- **Role-Based Access Control (RBAC):** Super Admin, Ministry Admin, State Admin, Nodal Officer, etc.
- **Advanced Dashboard Analytics:** Powered by Recharts. View users, applications, OCR usage, and dynamic charts with time-range filtering.
- **Complete Scheme Management:** Add, edit, archive, publish, duplicate, and bulk-import schemes via CSV.
- **Real-Time Synchronization:** Powered by Socket.IO. Admin updates reflect instantly on the Citizen portal without refreshing.
- **Audit Trails & Notifications:** Track all administrative actions and broadcast system-wide alerts.

### 👥 Citizen Portal
- **AI Scheme Assistant:** Streaming ChatGPT-style bot to answer queries and recommend personalized schemes based on user profiles.
- **Voice Navigation:** Multilingual Speech-to-Text (STT) and Text-to-Speech (TTS) for accessibility.
- **OCR Document Scanner:** Automatically extract details from Aadhaar, Income Certificates, and Passbooks.
- **Application Tracking:** Apply for schemes and track real-time status changes.
- **Dynamic Rule Engine:** Automatically matches user demographic data (age, income, occupation) against complex eligibility rules.

## Tech Stack
- **Frontend:** React 18, TypeScript, Tailwind CSS, Framer Motion, Recharts, Vite
- **Backend:** Node.js, Express, Socket.IO, Multer
- **Database:** MongoDB, Mongoose
- **AI & Services:** Google Gemini (Simulated Stream), Web Speech API, Tesseract.js

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/govscheme
JWT_SECRET=your_jwt_secret
```

### 3. Run Locally (Development)
Open two terminal windows:
```bash
# Start the Vite React Frontend (Port 3003)
npm run dev

# Start the Express Backend (Port 5000)
npm run server
```

### 4. Build for Production
```bash
npm run build
```

## Contributing
Push changes and submit PRs to the main repository. Ensure all code passes `npm run build` with zero chunk size warnings.

---
*Built for the citizens, by GovScheme AI.*
