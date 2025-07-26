# Cyprus Emergency Alert System - Development Guide

## Overview

This is a full-stack emergency alert system designed for Cyprus villages. The application provides real-time emergency notifications, interactive mapping, and community-based safety features. It's built as a monorepo with a React frontend and Express.js backend, using PostgreSQL with Drizzle ORM for data management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints with WebSocket support for real-time updates
- **Session Management**: Express sessions with PostgreSQL storage
- **Authentication**: Replit OIDC integration with Passport.js

### Database Design
- **Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM with Zod validation
- **Schema**: Village-based user system with emergency pins, alerts, and notifications

## Key Components

### Authentication System
- Uses Replit's OIDC provider for secure authentication
- Session-based authentication with PostgreSQL session storage
- User profiles linked to villages with admin roles
- Automatic session management and renewal

### Emergency Management
- **Emergency Pins**: Geo-located emergency reports with status tracking
- **Alert System**: Village-based alert broadcasting with multiple types (emergency, warning, info)
- **Real-time Updates**: WebSocket connections for instant notifications

### Geographic Features
- Village-based organization system
- Interactive mapping (prepared for Leaflet integration)
- Location-based emergency reporting and alerts

### Notification System
- Multi-channel notifications (browser, SMS, email)
- User preference management
- Quiet hours configuration
- Alert delivery tracking

## Data Flow

1. **User Authentication**: Replit OIDC → Session creation → User profile lookup/creation
2. **Emergency Reporting**: User input → Validation → Database storage → WebSocket broadcast → Alert delivery
3. **Alert Management**: Admin creates alert → Target village filtering → Multi-channel delivery → Read status tracking
4. **Real-time Updates**: Database changes → WebSocket events → Client updates → UI refresh

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **passport**: Authentication middleware
- **connect-pg-simple**: PostgreSQL session storage
- **ws**: WebSocket server implementation

### Frontend Dependencies
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI components
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight routing
- **date-fns**: Date manipulation utilities

### Development Dependencies
- **vite**: Build tool and dev server
- **tsx**: TypeScript execution
- **esbuild**: Fast JavaScript bundler

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with hot module replacement
- **Backend**: tsx with automatic restart on changes
- **Database**: Neon serverless PostgreSQL
- **Environment**: Replit-optimized with automatic deployments

### Production Build
- **Frontend**: Vite build → Static assets in `dist/public`
- **Backend**: esbuild → Single bundled file in `dist/index.js`
- **Deployment**: Single production server serving both frontend and API

### Database Management
- **Migrations**: Drizzle Kit for schema management
- **Schema**: Located in `shared/schema.ts` for type sharing
- **Connection**: Pooled connections via Neon serverless

### Security Considerations
- HTTPS-only in production
- Secure session cookies
- CSRF protection via session-based auth
- Input validation with Zod schemas
- Replit authentication integration

### Monitoring and Logging
- Request/response logging in development
- Error handling with proper HTTP status codes
- WebSocket connection monitoring
- Database query optimization tracking