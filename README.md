# GovScheme AI - National Government Scheme Eligibility Recommender

GovScheme AI is a centralized, AI-powered administration platform designed to manage government welfare schemes, streamline citizen applications, and leverage artificial intelligence for eligibility verification and multilingual support. It acts as a bridge between the Government of India and the citizens, empowering users to discover, apply for, and track welfare schemes effortlessly.

## 🚀 Key Features

### For Citizens
*   **Multilingual Support**: Fully accessible in 5 major languages: English, Hindi (हिन्दी), Tamil (தமிழ்), Telugu (తెలుగు), and Malayalam (മലയാളം).
*   **AI-Powered Scheme Discovery**: A conversational AI assistant that understands natural language to recommend relevant government schemes based on the user's demographic and financial profile.
*   **Rule-Based Eligibility Engine**: Automatically filters schemes that users are eligible for based on their customized profiles (Income, Category, Land Holding, etc.).
*   **Document Vault & OCR Scanner**: Securely upload and store necessary documents (Aadhaar, PAN, Income Certificates). Built-in OCR extraction assists in auto-filling verification forms.
*   **Application Status Tracker**: Real-time tracking of scheme applications (Pending, Approved, Rejected) directly from the dashboard.
*   **CSC Gram Panchayat Kiosk Mode**: A dedicated mode designed for Common Service Centers (CSCs) to assist multiple rural citizens from a single shared terminal.

### For Administrators & Nodal Officers
*   **System Dashboard**: Real-time analytics on user registrations, OCR processing rates, API health, and application statuses visualized via comprehensive charts.
*   **Scheme Management**: Create, edit, publish, or archive welfare schemes. Set detailed eligibility criteria and financial benefit amounts.
*   **Data Ingestion**: Directly import raw JSON scheme feeds from official government APIs (`data.gov.in`, `myscheme.gov.in`).
*   **Push Broadcasts**: Send urgent notifications and deadline reminders instantly to all registered citizen profiles.
*   **Auditing & Logs**: End-to-end AI log monitoring and administrative audit trails for transparency.

## 🛠️ Technology Stack

*   **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Framer Motion (Animations), Recharts (Analytics Data Visualization), React-i18next (Internationalization).
*   **Backend**: Node.js, Express.js, Socket.IO (for real-time updates).
*   **Database**: In-Memory MongoDB (mocked for development).
*   **Security**: Helmet, Express Rate Limiter, JWT Authentication.

## ⚙️ Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/subukavya/GovScheme.git
   cd GovScheme
   ```

2. **Install Dependencies**
   Install the root/frontend dependencies:
   ```bash
   npm install
   ```

   Install the backend dependencies:
   ```bash
   cd server
   npm install
   cd ..
   ```

3. **Run the Application Locally**

   You will need two terminal windows to run both the frontend and backend concurrently.

   **Terminal 1 (Backend Server):**
   ```bash
   npm run server
   ```
   *(Server runs on http://localhost:5000)*

   **Terminal 2 (Frontend Client):**
   ```bash
   npm run dev
   ```
   *(Vite runs on http://localhost:3003)*

### Default Credentials (Demo)
To access the Admin Portal, use the following credentials:
*   **Email**: `admin@govscheme.in`
*   **Password**: `password123`

## 🌍 Supported Languages
The UI and application content are fully localized using `react-i18next`. Currently supported languages include:
*   English (`en`)
*   Hindi (`hi`)
*   Tamil (`ta`)
*   Telugu (`te`)
*   Malayalam (`ml`)

## 📝 License
© 2026 GovScheme AI — Government Scheme Eligibility Recommender Platform. All Rights Reserved.
