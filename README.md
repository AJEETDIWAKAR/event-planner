# 🎉 Celebration Event Planner

> **AI-Powered Event Planning Assistant** — Plan weddings, birthdays, and community events with personalized ideas, smart budgets, milestone timelines, and vendor checklists.

Built with **React 19**, **Vite**, **Tailwind CSS v4**, and **Google Gemini AI**.

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg)](https://vite.dev)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI-Powered Plans** | Google Gemini generates personalized event plans with smart fallback when offline |
| 💰 **Budget Tracker** | Category-wise allocation that always sums to 100%, live spent-vs-allocated tracking, over-budget warnings |
| 📅 **Milestone Timeline** | Phase-wise milestones with completion checkboxes and progress percentage |
| 📋 **Vendor Checklist** | Track vendors with Pending → Booked → Paid status, priority badges, and add custom vendors |
| 💡 **Personalized Ideas** | AI-generated celebration ideas with one-click regeneration |
| 🖨️ **Export & Print** | Download plan as `.txt` file or print directly from the browser |
| 💾 **Local Storage** | Plans are saved only in your browser — 100% private, no account needed |
| 📱 **Responsive Design** | Works beautifully on desktop, tablet, and mobile |
| ♿ **Accessible** | Semantic HTML, keyboard navigation, ARIA labels, skip links, reduced-motion support |

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 6, Tailwind CSS v4
- **Icons**: Lucide React
- **AI Backend**: Google Gemini API (serverless function)
- **Deployment**: Vercel
- **Fonts**: Inter (Google Fonts)

---

## 📁 Project Structure

```
celebration-event-planner/
├── api/
│   └── generate-plan.js        # Vercel serverless function (Gemini API)
├── css/
│   └── styles.css               # Legacy CSS (vanilla)
├── js/
│   ├── ai-service.js            # AI client with offline fallback
│   ├── budget.js                # Budget allocation & analytics
│   ├── timeline.js              # Timeline & milestone logic
│   ├── checklist.js             # Vendor checklist management
│   ├── storage.js               # Local persistence layer
│   ├── security.js              # Input sanitization & validation
│   ├── rate-limit.js            # In-memory rate limiter
│   ├── data/
│   │   └── default-data.js      # Default templates for all event types
│   └── ui/
│       └── export-view.js       # Text export & print utilities
├── src/
│   ├── main.jsx                 # React entry point
│   ├── App.jsx                  # Main application component
│   ├── index.css                # Tailwind CSS + custom theme
│   └── components/
│       ├── Header.jsx           # App header with branding
│       ├── EventForm.jsx        # Event details input form
│       ├── Overview.jsx         # Stats cards & strategy summary
│       ├── IdeasGrid.jsx        # Personalized ideas grid
│       ├── BudgetTracker.jsx    # Budget table with spend tracking
│       ├── Timeline.jsx         # Milestone timeline with checkboxes
│       ├── VendorChecklist.jsx  # Vendor cards with status management
│       └── ActionsRow.jsx       # Print & Export action buttons
├── tests/                       # Unit tests (node:test)
├── server.mjs                   # Local dev API server
├── vite.config.js               # Vite configuration
├── vercel.json                  # Vercel deployment + security headers
├── .env                         # Environment variables (API key)
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 20.0.0
- **npm** (comes with Node.js)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/AJEETDIWAKAR/event-planner.git
cd event-planner

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will open at **http://localhost:5173** 🎉

### Environment Variables

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

> **Note:** The app works perfectly without an API key — it falls back to smart built-in templates automatically.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server (http://localhost:5173) |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build locally |
| `npm run server` | Start backend API server (http://localhost:3000) |
| `npm test` | Run unit tests |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

---

## 🔒 Security

- **API Key Protection**: `GEMINI_API_KEY` stays server-side only, never exposed to the browser
- **Security Headers**: Strict CSP, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` via `vercel.json`
- **Input Sanitization**: All inputs sanitized and range-checked on both client and server
- **Prompt Injection Hardening**: User data is JSON-encoded and labeled untrusted; AI output is schema-validated and re-sanitized before rendering
- **Rate Limiting**: Per-IP rate limiter with configurable thresholds

---

## ♿ Accessibility

- Semantic HTML5 landmarks and headings
- Skip-to-content link
- All form controls properly labeled with `aria-*` attributes
- `aria-live` status regions for dynamic content
- Visible focus rings for keyboard navigation
- `prefers-reduced-motion` support
- Print-friendly styles

---

## 🌐 Deploy to Vercel

1. Import the repository in [Vercel](https://vercel.com)
2. Add environment variable: `GEMINI_API_KEY`
3. Optionally set `GEMINI_MODEL` (default: `gemini-2.5-flash`)
4. Deploy! 🚀

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Ajeet Diwakar**

- GitHub: [@AJEETDIWAKAR](https://github.com/AJEETDIWAKAR)

---

<p align="center">
  Made with ❤️ for smarter event planning
</p>
