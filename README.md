# 📧 Email Agent - Production Ready

An AI-powered email assistant that analyzes, categorizes, and helps draft replies to emails using Claude AI.

## Features ✨

- ✅ **AI Email Analysis** - Automatically categorize and prioritize emails
- ✅ **Smart Reply Drafting** - Generate contextual email replies in different tones
- ✅ **Ask Questions** - Get AI-powered answers about email content
- ✅ **User Authentication** - Secure JWT-based authentication
- ✅ **Multi-User Support** - Database-backed user management
- ✅ **Gmail/Outlook Ready** - OAuth integration ready (OAuth implementation in progress)
- ✅ **Production Grade** - Security headers, rate limiting, logging, error handling
- ✅ **Docker Ready** - Containerized deployment with docker-compose

## Tech Stack 🛠

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- Anthropic Claude API
- JWT Authentication
- Winston Logging
- Helmet (Security)
- Express Rate Limiting

**Frontend:**
- React 18
- React DOM
- Axios (for API calls)

## Prerequisites 📋

- **Node.js** v18+
- **npm** v8+
- **MongoDB** (local or Atlas)
- **Anthropic API Key** - [Get it here](https://console.anthropic.com)
- **Docker & Docker Compose** (for containerized deployment)

## Quick Start 🚀

### Option 1: Development (Local)

#### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
```

#### 2. Frontend Setup (in another terminal)

```bash
cd frontend
npm install
npm start
```

Visit `http://localhost:3000`

### Option 2: Docker Deployment

```bash
# Set environment variables
export ANTHROPIC_API_KEY="sk-ant-your-key-here"
export JWT_SECRET="your-secret-key"

# Build and run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

The app will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Docs:** http://localhost:3001/api/docs
- **Health Check:** http://localhost:3001/health

## Configuration ⚙️

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server
NODE_ENV=production
PORT=3001

# Database
MONGODB_URI=mongodb://admin:password@localhost:27017/email-agent

# Security
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRE=7d

# API
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Frontend
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

## API Endpoints 📡

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user (requires token)
- `PATCH /auth/profile` - Update profile (requires token)

### Emails (Requires Authentication)

- `GET /api/emails` - Get all emails
- `POST /api/emails/analyze` - Analyze all emails with AI
- `POST /api/emails/draft-reply` - Draft reply for email
- `POST /api/emails/ask` - Ask question about email

### System

- `GET /health` - Health check
- `GET /api/docs` - API documentation

## Authentication 🔐

The API uses JWT (JSON Web Tokens) for authentication.

**Flow:**
1. Register or login to get a token
2. Include token in `Authorization` header: `Authorization: Bearer <token>`
3. Token expires after 7 days (configurable)

Example:
```bash
curl -H "Authorization: Bearer your-token-here" http://localhost:3001/api/emails
```

## Database Schema 📊

### User Model
```javascript
{
  email: String (unique, lowercase),
  password: String (hashed with bcrypt),
  name: String,
  googleId: String (optional),
  outlookId: String (optional),
  emailProvider: 'none' | 'gmail' | 'outlook',
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Email Model
```javascript
{
  userId: ObjectId (ref: User),
  from: String,
  subject: String,
  body: String,
  timestamp: Date,
  read: Boolean,
  analysis: {
    category: String,
    priority: String,
    summary: String,
    flagged: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features 🛡️

- ✅ Helmet.js for HTTP security headers
- ✅ CORS enabled with origin validation
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ JWT token-based authentication
- ✅ Password hashing with bcryptjs
- ✅ Input validation with Joi
- ✅ SQL injection prevention (MongoDB)
- ✅ Error handling without exposing stack traces in production
- ✅ Secure HTTP-only cookies (ready for implementation)

## Logging 📝

Logs are stored in the `logs/` directory:
- `logs/combined.log` - All logs
- `logs/error.log` - Errors only

Winston logger configuration supports:
- File rotation (implement for production)
- Sentry integration (ready for implementation)
- ELK stack compatibility

## Deployment Checklist ✅

### Before Going to Production

- [ ] Change `JWT_SECRET` to a strong, random value
- [ ] Set `NODE_ENV=production`
- [ ] Configure MongoDB Atlas or secure MongoDB instance
- [ ] Set `FRONTEND_URL` to your production domain
- [ ] Enable HTTPS/SSL
- [ ] Set up log rotation and monitoring
- [ ] Configure backup strategy for MongoDB
- [ ] Set up CI/CD pipeline
- [ ] Configure monitoring and alerting
- [ ] Implement Sentry for error tracking
- [ ] Test all email integration flows
- [ ] Set up email provider OAuth (Gmail/Outlook)
- [ ] Configure domain DKIM/SPF/DMARC
- [ ] Implement rate limiting per user
- [ ] Set up database indexes
- [ ] Test failover procedures
- [ ] Document API rate limits for customers
- [ ] Implement API versioning

## Gmail/Outlook Integration (Coming Soon) 🔄

**Ready to implement:**
- OAuth2 authentication flow
- Token refresh mechanism
- Email sync from Gmail/Outlook
- Real email support instead of mock data

**Steps:**
1. Set up Google OAuth App (Gmail)
2. Set up Microsoft OAuth App (Outlook)
3. Configure OAuth callback routes
4. Implement email sync background job
5. Store encrypted access tokens

## Monitoring & Logging 📊

### Health Endpoints

```bash
# API health
curl http://localhost:3001/health

# API documentation
curl http://localhost:3001/api/docs
```

### Log Levels

- `error` - Errors only
- `warn` - Warnings and errors
- `info` - Info, warnings, and errors (default)
- `debug` - All messages

Set via `LOG_LEVEL` environment variable.

## Performance Optimization 🚀

- Database indexing on frequently queried fields
- JWT tokens for stateless authentication
- Streaming responses for large email lists
- Rate limiting to prevent abuse
- MongoDB connection pooling

## Troubleshooting 🔧

### Cannot connect to MongoDB

```bash
# Check MongoDB is running
mongosh
# Should show MongoDB shell prompt

# Update MONGODB_URI in .env
MONGODB_URI=mongodb://localhost:27017/email-agent
```

### API Key errors (401)

```bash
# Verify API key is set
echo $ANTHROPIC_API_KEY

# Update .env
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### Port already in use

```bash
# Change port in .env
PORT=3002

# Check what's using port 3001
lsof -i :3001  # macOS/Linux
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess  # Windows
```

## Contributing 🤝

1. Create a feature branch
2. Commit changes
3. Push to branch
4. Create Pull Request

## License 📄

MIT License - See LICENSE file for details

## Support 💬

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation at `/api/docs`
3. Check logs in `logs/` directory

---

**Made with ❤️ for email productivity**
