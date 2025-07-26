# Cyprus Emergency Alert System - Development Guide

## Overview

This is a full-stack emergency alert system designed for Cyprus villages. The application provides real-time emergency notifications, interactive mapping, and community-based safety features. It's built with modern web technologies and follows a clear separation between client and server components with shared schemas.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library using the "new-york" style
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with custom styling and comprehensive component library
- **Internationalization**: Custom language context supporting English and Greek

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints with WebSocket support for real-time updates
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **Authentication**: Replit OIDC integration with Passport.js
- **Real-time Communication**: WebSocket server for live emergency updates

### Database Design
- **Database**: PostgreSQL via Neon serverless (@neondatabase/serverless)
- **ORM**: Drizzle ORM with Zod validation for type safety
- **Schema**: Comprehensive emergency management system including:
  - User management with village associations and admin roles
  - Emergency pins with geolocation and status tracking
  - Alert system with village-based targeting
  - Emergency services integration with call logging
  - Evacuation route planning with detailed metadata
  - SMS alert system for critical communications
  - Session storage for authentication

## Key Components

### Authentication System
- Uses Replit's OIDC provider for secure authentication
- Session-based authentication with PostgreSQL session storage
- User profiles linked to villages with admin role management
- Automatic session management and renewal
- Unauthorized request handling with automatic re-authentication

### Emergency Management Features
- **Emergency Pins**: Geo-located emergency reports with type classification, status tracking, and real-time updates
- **Alert System**: Village-based alert broadcasting with multiple severity levels (emergency, warning, info)
- **Emergency Services Integration**: Direct access to Cyprus emergency contacts with call logging for safety
- **Evacuation Route Planning**: Admin-controlled route management with detailed waypoints, capacity, and hazard information
- **SMS Alert System**: Critical communication channel for emergency notifications
- **Real-time Updates**: WebSocket connections for instant emergency notifications

### Geographic and Communication Features
- Village-based organization system for localized emergency management
- Interactive mapping system (prepared for Leaflet integration)
- Multi-language support (English/Greek) for accessibility
- Real-time notification system with browser and SMS integration

### User Interface
- Responsive design using Tailwind CSS with custom emergency-themed color palette
- Comprehensive component library based on shadcn/ui and Radix UI
- Mobile-first approach with touch-friendly interfaces
- Dark/light mode support preparation
- Accessibility features built into all components

## Data Flow

1. **Authentication Flow**: Users authenticate via Replit OIDC → Session creation → User profile association with village
2. **Emergency Reporting**: Location capture → Emergency type selection → Database storage → Real-time broadcast via WebSocket
3. **Alert Distribution**: Admin creates alert → Village targeting → Database storage → WebSocket notification → SMS delivery (if enabled)
4. **Real-time Updates**: Database changes → WebSocket broadcast → Client cache invalidation → UI updates

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless for scalable data storage
- **Authentication**: Replit OIDC for secure user authentication
- **Real-time**: WebSocket (ws library) for live updates
- **Styling**: Tailwind CSS + Radix UI for modern, accessible UI components
- **Validation**: Zod for runtime type validation and schema validation

### Development Tools
- **Build System**: Vite with React plugin for fast development
- **Database Migrations**: Drizzle Kit for schema management
- **Type Safety**: TypeScript with strict configuration
- **Code Quality**: Comprehensive linting and type checking

## Deployment Strategy

### Development Environment
- **Server**: Node.js development server with tsx for TypeScript execution
- **Client**: Vite development server with hot module replacement
- **Database**: Neon serverless PostgreSQL for development and production
- **Build Process**: Vite builds client, esbuild bundles server for production

### Production Build
- **Client Build**: Vite creates optimized static assets in `dist/public`
- **Server Build**: esbuild creates bundled Node.js application in `dist`
- **Static Serving**: Express serves client assets in production mode
- **Environment Variables**: DATABASE_URL for Neon connection, SESSION_SECRET for security

### Key Architectural Decisions

1. **Monorepo Structure**: Client, server, and shared schemas in single repository for better code sharing and type safety
2. **Type-First Approach**: Shared TypeScript schemas ensure consistency between frontend and backend
3. **Real-time First**: WebSocket integration for immediate emergency response capabilities
4. **Village-Centric Design**: Geographic organization around Cyprus villages for localized emergency management
5. **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with real-time features
6. **Security-First**: Session-based authentication with secure cookie handling and CSRF protection
7. **Scalable Database**: Serverless PostgreSQL with efficient indexing for emergency response speed

## Recent Development Progress (January 26, 2025)

### Current Work Session Status

**Completed Features:**
1. **SMS Alert System**: Fully functional SMS alert functionality with role-based access control
   - Village admins can send alerts to their village residents only
   - Main admin can send alerts to all users across Cyprus
   - Complete message composition interface with alert types and priority levels
   - Message history and delivery tracking system
   - Fixed API call errors and proper message validation

2. **Greek Language Support**: Comprehensive internationalization implementation
   - Created language context with persistent browser storage
   - Implemented language switcher component in navigation header
   - Added complete Greek translations for all interface elements
   - Supports English (🇬🇧 EN) and Greek (🇬🇷 EL) with flag indicators
   - Translations cover navigation, dashboard, emergency services, SMS alerts, and all forms

3. **User Interface Updates**:
   - Updated navigation header with language switcher
   - Removed "Emergency Contacts" quick action from dashboard (kept "Emergency Services")
   - Dashboard now fully supports bilingual interface with dynamic text updates
   - All user-facing text now uses translation system

4. **Testing Infrastructure**:
   - Created village admin test account (Maria Kouris - village.admin@paphos.cy)
   - SMS alert functionality tested and working
   - Language switching functionality operational

**Current Technical State:**
- Application successfully running on port 5000
- Database: PostgreSQL with Neon serverless, all schemas updated
- Authentication: Replit OIDC integration working properly
- Real-time: WebSocket connections stable for emergency updates
- Frontend: React + TypeScript with Vite, all components updated
- Backend: Express.js + Drizzle ORM, all API endpoints functional

**Active Issues Being Monitored:**
- 2 minor LSP diagnostics in client/src/pages/sms-alerts.tsx (type safety improvements)
- Some JavaScript console errors related to DOM manipulation (non-critical)
- Regular API polling working correctly (emergency-pins and alerts every 30 seconds)

**Files Recently Modified:**
- `client/src/main.tsx` - Added LanguageProvider wrapper
- `client/src/contexts/language-context.tsx` - Complete translation system
- `client/src/components/language-switcher.tsx` - Language toggle component
- `client/src/components/navigation-header.tsx` - Integrated language switcher
- `client/src/components/dashboard-overview.tsx` - Added Greek translations
- `client/src/pages/sms-alerts.tsx` - Fixed API call errors and validation
- `shared/schema.ts` - SMS alerts schema with proper types
- `server/routes.ts` - SMS alert endpoints with role-based filtering
- `server/storage.ts` - SMS alert storage operations

**Next Potential Improvements:**
- Address remaining TypeScript type safety warnings
- Enhance error handling for better user experience
- Consider adding more emergency management features
- Optimize WebSocket connection stability

**System Architecture Status:**
- All core emergency management features operational
- Multi-language support fully implemented
- Role-based access control working correctly
- Real-time emergency notifications functional
- Database schema comprehensive and stable