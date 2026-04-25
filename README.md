<div align="center">

# CrisisGuardian 🛡️

**Comprehensive Emergency Preparedness & Crisis Management Platform**

[![Node.js 20+](https://img.shields.io/badge/Node.js-20+-brightgreen?style=flat-square)](https://nodejs.org/)
[![React + Vite](https://img.shields.io/badge/React-Vite-61DAFB?style=flat-square)](https://vitejs.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-Persistent-003B57?style=flat-square)](https://www.sqlite.org/)
[![MIT License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

</div>

## 🎯 About CrisisGuardian

CrisisGuardian is an intelligent platform designed to empower institutions and individuals with **real-time emergency preparedness, virtual crisis drills, and AI-powered safety guidance**. Whether you're managing school evacuations, workplace emergencies, or community crisis response, CrisisGuardian provides the tools to prepare, train, and respond effectively.

### Core Features
- 🚨 **Virtual Drills** - Conduct realistic emergency simulations with analytics
- 🤖 **AI Safety Advisor** - Get instant guidance from Gemini AI during emergencies
- 📚 **Interactive Education** - Video lessons and modules for crisis preparedness
- 👥 **Emergency Contacts** - Centralized contact management and rapid notification
- 📊 **Admin Dashboard** - Real-time monitoring and drill analytics
- 🔐 **Secure Authentication** - JWT-based auth with OTP verification

## 🚀 Quick Start

### Prerequisites
- **Node.js 20+** ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)

### Installation & Launch

```bash
# 1. Clone and install
git clone <repo-url>
cd CrisisGuardian
npm install

# 2. Configure environment (see below)
# Create .env.local with your API keys

# 3. Start everything with one command
npm run dev:full
```

Then open:
- **Frontend:** http://localhost:3000
- **API Health:** http://localhost:3001/api/health

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Required: Gemini AI Integration
GEMINI_API_KEY=your_api_key_here

# Required: JWT Authentication
JWT_SECRET=your_strong_random_secret_here

# Optional: Email OTP Delivery (remove to use test mode)
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM="CrisisGuardian <no-reply@yourdomain.com>"
```

### Test Credentials

Pre-configured test accounts (available after first run):
- **Student:** `student@test.com` / `password`
- **Admin:** `admin@test.com` / `password`

## 📝 Available Commands

| Command | Purpose |
|---------|---------|
| `npm run dev:full` | Start frontend + API together (recommended) ⭐ |
| `npm run dev` | Frontend only (port 3000) |
| `npm run dev:api` | API server only (port 3001) |
| `npm run build` | Production frontend build |
| `npm run start:api` | Start API without watch mode |

## 🏗️ Project Architecture

```
CrisisGuardian/
├── components/          # React UI components
│   ├── AdminDashboard.tsx
│   ├── VirtualDrill.tsx
│   ├── AISafetyAdvisor.tsx
│   └── ...
├── services/            # Business logic & API integration
│   ├── authService.ts
│   ├── geminiService.ts
│   ├── analyticsService.ts
│   └── dbService.ts
├── server/              # Express API backend
│   └── index.js
├── data/                # SQLite database (persisted)
│   └── crisisguardian.db
└── public/              # Static assets
```

## 🔒 Security Architecture

CrisisGuardian implements **enterprise-grade security** practices:

| Feature | Implementation |
|---------|-----------------|
| **Authentication** | JWT tokens with HTTP-only signed session cookies |
| **Password Storage** | bcrypt hashing (10+ salt rounds) |
| **OTP Verification** | Server-side generation & validation |
| **API Key Protection** | Proxied through backend (never exposed to frontend) |
| **Sensitive Data** | OTP emails via SMTP encryption |
| **CORS** | Properly configured for production deployments |

## 🗄️ Database

- **Type:** SQLite (lightweight, file-based)
- **Location:** `data/crisisguardian.db`
- **Auto-Seeding:** Test data & institutions loaded on first run
- **Persistence:** Data survives restarts (local) or requires disk mounting (production)

### OTP Delivery Modes

| Environment | Mode | OTP Delivery |
|-------------|------|--------------|
| **Production** | Standard | Email only |
| **Development (SMTP configured)** | Email | Sent to configured inbox |
| **Development (SMTP not configured)** | Test | Returned as `otpHint` in API response |

## 🚀 Deployment

### Option 1: Render (Recommended for Hackathons) ⭐

The easiest path to production:

```bash
# 1. Push to GitHub
git push origin main

# 2. In Render Dashboard:
#    - Create Blueprint from your repo
#    - Uses render.yaml in this project (auto-configured)

# 3. Set environment variables:
```

**Required Env Vars on Render:**
```env
GEMINI_API_KEY=your_key
JWT_SECRET=your_secret
SMTP_HOST=smtp.gmail.com  # or your provider
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_app_password
SMTP_FROM=CrisisGuardian <noreply@yourdomain.com>
```

**After Deploy:**
- App: `https://your-app.onrender.com`
- Health: `https://your-app.onrender.com/api/health`

**Note:** Free tier has ephemeral storage. For persistent SQLite data, upgrade plan and mount disk at `/opt/render/project/src/data`.

### Option 2: Docker

```bash
# Build image
docker build -t crisisguardian .

# Run container
docker run -p 3001:3001 \
  -e GEMINI_API_KEY=your_key \
  -v $(pwd)/data:/app/data \
  crisisguardian
```

Then open: `http://localhost:3001`

### Option 3: Railway

1. Create new Railway project from this repo
2. **Build Command:** `npm install && npm run build`
3. **Start Command:** `npm start`
4. Add environment variables (see Render section)
5. Mount a volume to `/app/data` for SQLite persistence

## 💻 Tech Stack

**Frontend:**
- ⚛️ React 18+ with TypeScript
- ⚡ Vite (blazing fast dev experience)
- 🎨 Modern responsive UI
- 📱 Mobile-first design

**Backend:**
- 🔵 Node.js + Express
- 🗄️ SQLite (persistent data)
- 🔐 JWT + Session authentication
- 🤖 Gemini AI integration

**DevOps:**
- 🐳 Docker containerization
- 🚀 Render deployment support
- 📦 Automated builds & CI/CD ready

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/logout` - Logout session

### AI & Safety
- `POST /api/ai/safety-advice` - Get emergency safety guidance
- `GET /api/ai/health` - Check AI service status

### Drills & Activities
- `GET /api/drills` - List all drills
- `POST /api/drills/start` - Initiate a drill
- `POST /api/drills/complete` - Mark drill as complete
- `GET /api/analytics` - Get drill analytics

For complete API documentation, see `server/index.js`

## 🎯 Roadmap

- [ ] Real-time notification system (WebSockets)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics & reporting
- [ ] Integration with emergency services APIs
- [ ] Multi-language support
- [ ] Offline-first PWA features
- [ ] Custom drill templates
- [ ] Team collaboration features

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/your-feature`
5. **Open** a Pull Request

### Development Guidelines
- Use TypeScript for type safety
- Follow React best practices
- Keep components modular and reusable
- Add tests for new features
- Update README for new features

## 📄 License

MIT License - see LICENSE file for details

## 🙋 Support & Questions

- 📧 Email: support@crisisguardian.com
- 💬 Issues: [GitHub Issues](../../issues)
- 📖 Documentation: See inline code comments

---

<div align="center">

**Made with 💙 for Emergency Preparedness**

[⬆ Back to Top](#crisisguardian-)

</div>
