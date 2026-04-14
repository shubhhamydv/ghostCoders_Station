 # 🚀 GhostCoders Station – AI Placement Mentor

An AI-powered adaptive learning platform that helps students prepare for placements through **personalized learning paths, interview preparation, and performance tracking**.

---

## 📌 Overview

GhostCoders Station is designed to solve a major problem in student placement preparation:

> ❌ Generic preparation methods don’t work for everyone.

This platform uses **AI + analytics** to:

* Identify weak areas
* Recommend targeted preparation
* Provide structured learning modules
* Simulate real interview scenarios

---

## ✨ Key Features

### 🧠 AI-Powered Learning

* Smart recommendations using AI (`src/lib/ai.ts`)
* Personalized preparation paths

### 📊 Dashboard System

* Track performance and progress
* Visual learning insights

### 💼 Placement Preparation

* Company-specific preparation modules
* Interview practice sections
* Job & opportunity tracking

### ⏱️ Productivity Tools

* Focus Timer component
* Study session tracking

### 🔐 Authentication

* User login/signup system
* Secure session handling via Supabase

---

## 🛠️ Tech Stack

### Frontend

* ⚛️ React.js (with TypeScript)
* ⚡ Vite
* 🎨 Tailwind CSS
* 🧩 ShadCN UI Components

### Backend / Services

* 🟢 Supabase (Auth + DB + Edge Functions)
* 🤖 AI Integration (custom logic in `ai.ts`)

### State Management

* Zustand (`useStationStore.ts`)

---

## 📂 Project Structure

```bash
ghostCoders_Station/
│── public/                 # Static assets
│── src/
│   ├── components/         # UI Components
│   ├── pages/              # App pages (Dashboard, Auth, etc.)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities & AI logic
│   ├── store/              # Zustand state management
│   ├── integrations/       # Supabase integration
│   └── assets/             # Images
│
│── supabase/
│   ├── functions/          # Edge functions (chat AI)
│   └── migrations/         # Database schema
│
│── README.md
```

---

## ⚙️ Setup & Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/shubhhamydv/ghostCoders_Station.git
cd ghostCoders_Station
```

---

### 2️⃣ Install Dependencies

```bash
npm install
```

---

### 3️⃣ Setup Environment Variables

Create a `.env` file in root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_OPENAI_API_KEY=your_api_key
```

---

### 4️⃣ Run the Development Server

```bash
npm run dev
```

---

## 🔌 Supabase Setup

1. Create a project in Supabase
2. Run migrations from:

```
supabase/migrations/
```

3. Deploy edge function:

```
supabase/functions/chat/
```

---

## 📸 Screens (Add Screenshots Here)

* Landing Page (`/Landing.tsx`)
* Dashboard (`/Dashboard.tsx`)
* Interview Prep Module
* Company Prep Section

---

## 🚀 Future Enhancements

* 🎤 AI Mock Interview (voice-based)
* 📄 Resume Analyzer
* 📱 Mobile Responsive Improvements
* 🧠 Better AI feedback (LLM fine-tuning)
* 🌐 Deployment (Vercel + Supabase hosting)

---

## 🧪 Testing

```bash
npm run test
```

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a branch (`feature/your-feature`)
3. Commit your changes
4. Push and open a PR

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**Shubham Yadav**
GitHub: https://github.com/shubhhamydv

---

## ⭐ Support

If you found this project useful:

* ⭐ Star the repository
* 🍴 Fork it
* 🚀 Share it

---

> Built with ❤️ to help students crack placements smarter, not harder.
