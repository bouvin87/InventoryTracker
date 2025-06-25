# Replit Configuration Guide

## Overview

This is a full-stack inventory management system built with a modern React frontend and Express.js backend. The application is designed for batch inventory management with features for importing/exporting data, real-time updates, and user authentication.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Shadcn/UI components with Radix UI primitives
- **Styling**: Tailwind CSS for responsive design
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: Passport.js with local strategy and express-session
- **File Processing**: Multer for file uploads, XLSX for Excel parsing
- **Real-time Communication**: WebSocket for live updates
- **Database**: SQLite with Drizzle ORM (configured for PostgreSQL migration)

## Key Components

### Database Layer
- **ORM**: Drizzle with SQLite adapter (ready for PostgreSQL migration)
- **Schema**: Defined in `shared/schema.ts` with Zod validation
- **Tables**: 
  - `batches`: Core inventory items with status tracking
  - `users`: User authentication and role management
- **Session Storage**: SQLite-based session store for authentication

### Authentication System
- **Strategy**: Local username/password authentication
- **Session Management**: Express-session with SQLite store
- **Password Security**: Scrypt-based password hashing with salt
- **User Roles**: Role-based access control

### File Processing
- **Excel Import**: Multi-format Excel parsing with column mapping
- **Excel Export**: Dynamic report generation with filtering options
- **File Validation**: Size limits and format checking

### Real-time Features
- **WebSocket Integration**: Live inventory updates across clients
- **Global Socket Management**: Singleton pattern for connection efficiency

## Data Flow

1. **Authentication Flow**: User login → Session creation → Protected route access
2. **Inventory Management**: CRUD operations with real-time WebSocket updates
3. **Import Process**: Excel upload → Server parsing → Database insertion → Client refresh
4. **Export Process**: Database query → Excel generation → File download

## External Dependencies

### Frontend Dependencies
- **UI Components**: Comprehensive Radix UI component library
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Material Icons and Lucide React
- **Utilities**: Class variance authority for component variants

### Backend Dependencies
- **Database**: Better SQLite3 for local development, Neon for production
- **File Processing**: XLSX for spreadsheet operations
- **Authentication**: Passport ecosystem for secure login
- **WebSocket**: ws library for real-time communication

## Deployment Strategy

### Development
- **Environment**: Node.js 20 with hot reload via tsx
- **Database**: Local SQLite file for rapid development
- **Ports**: Frontend (5000), WebSocket (same port)

### Production
- **Build Process**: Vite build + ESBuild bundling
- **Database**: PostgreSQL via Neon Database (configured but not active)
- **Deployment**: Autoscale deployment target on Replit
- **Session Persistence**: SQLite session store for reliability

### Environment Configuration
- **Database URL**: PostgreSQL connection string (ready for migration)
- **Session Security**: Configurable session secrets
- **File Limits**: 30MB upload limit for large Excel files

## Recent Changes

- **June 25, 2025 - Session Management Fix**: Fixed critical session handling issues in local installation that caused immediate logout after successful login
- **June 25, 2025 - User Management System**: Added comprehensive user management in settings with ability to edit (name, username, role) and create new users
- **June 25, 2025 - Performance Optimizations**: Implemented smart pagination, filtering enhancements, and Galaxy Tab A7 optimizations
- **June 25, 2025 - Initial Setup**: Complete inventory management system with Excel import/export and real-time updates

## User Preferences

Preferred communication style: Simple, everyday language (Swedish).
Technical preferences: Focus on essential fields only - Username, Name, Role for user editing.

## Changelog

- June 25, 2025. Initial setup and major feature implementations