# Cyprus Emergency App

A full-stack emergency management application with React frontend, Express.js backend, and PostgreSQL database.

## 🚀 Quick Start (Local Development)

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

### 1. Clone and Install

```bash
git clone <your-repository-url>
cd <project-directory>
npm install
```

### 2. Environment Setup

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual values
nano .env  # or use your preferred editor
```

### 3. Database Setup

#### Option A: Local PostgreSQL
1. Create a new PostgreSQL database:
```sql
CREATE DATABASE cyprus_emergency;
CREATE USER cyprus_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE cyprus_emergency TO cyprus_user;
```

2. Update your `.env` file:
```env
DATABASE_URL=postgresql://cyprus_user:your_password@localhost:5432/cyprus_emergency
```

#### Option B: Cloud Database (Recommended)
Use a cloud provider like Neon, Supabase, or Railway:

1. Create a new PostgreSQL database
2. Copy the connection string to your `.env` file

### 4. Database Migration

```bash
# Generate and run database migrations
npm run db:generate
npm run db:push

# (Optional) Open database studio
npm run db:studio
```

### 5. Start Development Server

```bash
# Start the full-stack application
npm run dev

# Or run frontend and backend separately:
npm run dev:server  # Backend only (port 5000)
npm run dev:client  # Frontend only (port 5173)
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Full App**: http://localhost:5000 (serves both frontend and backend)

## 📁 Project Structure

```
├── client/           # React frontend application
│   ├── src/
│   └── index.html
├── server/           # Express.js backend
│   ├── index.ts      # Main server file
│   ├── routes.ts     # API routes
│   ├── db.ts         # Database connection
│   └── ...
├── shared/           # Shared types and schemas
├── cyprus-emergency-mobile/  # Mobile app (React Native)
├── package.json      # Dependencies and scripts
├── vite.config.ts    # Vite configuration
├── drizzle.config.ts # Database configuration
└── .env.example      # Environment variables template
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `SESSION_SECRET` | ✅ | Secret key for session encryption |
| `PORT` | ❌ | Server port (default: 5000) |
| `NODE_ENV` | ❌ | Environment (development/production) |
| `TWILIO_ACCOUNT_SID` | ❌ | Twilio SMS service (optional) |
| `TWILIO_AUTH_TOKEN` | ❌ | Twilio authentication token |
| `TWILIO_PHONE_NUMBER` | ❌ | Twilio phone number for SMS |

### Optional Features

#### SMS Verification (Twilio)
To enable SMS verification, sign up for Twilio and add your credentials to `.env`:

```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

#### Replit Authentication
If you want to enable Replit authentication (not recommended for local development):

```env
REPL_ID=your_repl_id
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=your-domain.repl.co
```

## 🛠 Development

### Available Scripts

- `npm run dev` - Start full development server
- `npm run dev:server` - Start backend only
- `npm run dev:client` - Start frontend only
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type checking
- `npm run db:push` - Push database schema
- `npm run db:generate` - Generate migrations
- `npm run db:studio` - Open database studio

### Database Management

```bash
# View your database in the browser
npm run db:studio

# Generate new migrations after schema changes
npm run db:generate

# Apply migrations to database
npm run db:push
```

### API Endpoints

The server provides several endpoints:

- `GET /` - Serve React application
- `GET /api/health` - Health check
- `GET /api/login` - Authentication (disabled in dev mode)
- `POST /api/*` - Various API endpoints

## 🚀 Production Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Cloud Provider

1. **Railway/Render/Vercel**: Connect your GitHub repository
2. **Set environment variables** in your hosting provider
3. **Database**: Use a managed PostgreSQL service
4. **Build command**: `npm run build`
5. **Start command**: `npm run start`

### Environment Variables for Production

Ensure these are set in your production environment:
- `DATABASE_URL` - Production database connection
- `SESSION_SECRET` - Strong random secret
- `NODE_ENV=production`

## 📱 Mobile App

The project includes a React Native mobile app in the `cyprus-emergency-mobile/` directory. 

To run the mobile app:

```bash
cd cyprus-emergency-mobile
npm install
expo start
```

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify your `DATABASE_URL` is correct
   - Ensure PostgreSQL is running
   - Check network connectivity

2. **Port Already in Use**
   - Change the `PORT` in your `.env` file
   - Kill the process using the port: `lsof -ti:5000 | xargs kill`

3. **Authentication Issues**
   - In development, authentication is disabled by default
   - Check that Replit auth variables are empty in `.env`

4. **Build Errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run check`

### Development Tips

- Use `npm run db:studio` to visually inspect your database
- Check the server logs for API errors
- Frontend development server supports hot reload
- Backend restarts automatically with `tsx`

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

For questions or support, please open an issue in the repository.