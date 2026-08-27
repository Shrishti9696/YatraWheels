# YatraWheels

An AI-powered vehicle booking and travel planning marketplace optimized for localized transport ecosystems in India.

🔗 **Live Application:** [https://yatrawheels-seven.vercel.app]

---

## 🚀 Key Engineering & Architecture Highlights

*   **Multi-Tenant Role Architecture:** Built a robust access-control system handling 4 distinct real-time user flows: Users (consumers), Vendors (fleet owners), Drivers (fulfillment), and Admins (platform oversight).
*   **State & Booking Management:** Engineered an Express-based transaction lifecycle to handle real-time vehicle booking states, preventing multi-vendor assignment conflicts.
*   **Intelligent Routing Engine:** Integrated OpenAI GPT-4o-mini to parse natural language and dynamically generate localized travel itineraries mapped to fleet availability.
*   **Monetization Pipeline:** Fully integrated secure payment flows using Razorpay API for vendor-payout tracking and user collections.

---

## 🛠️ Tech Stack

*   **Frontend:** React 18, Vite, TypeScript, Tailwind CSS v4, Framer Motion
*   **Backend:** Express 5, Node.js, TypeScript
*   **Database:** MongoDB (Mongoose ODM)
*   **AI Integration:** OpenAI API (GPT-4o-mini)
*   **Payments:** Razorpay Node SDK

---

## 📦 Repository Structure

This project is built as a TypeScript monorepo to maximize code reuse:

```text
├── frontend/     # React 18 Single Page Application (Vite)
├── backend/      # Express 5 REST API Server
└── lib/          # Shared TypeScript type definitions and validation schemas
```
