# Metabolic Health Coach - GLP-1 Treatment Support Platform

## Overview

This is a comprehensive web-based application designed to support patients undergoing GLP-1 treatment (such as Semaglutide) for obesity and metabolic health management. The platform provides symptom tracking, medication reminders, educational content, and progress monitoring in a user-friendly interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern full-stack architecture with clear separation between client and server components:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with Shadcn/ui component library
- **Build Tool**: Vite for fast development and optimized production builds
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives for accessibility and consistent behavior

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript for type safety
- **API Design**: RESTful API with JWT-based authentication
- **Session Management**: In-memory storage for development (configurable for production)

## Key Components

### Authentication System
- JWT-based authentication with bcrypt password hashing
- Token storage in localStorage with automatic header injection
- Protected routes with authentication middleware
- User registration with medical condition tracking

### Data Models
The application manages four core entities:
- **Users**: Personal information, medical conditions, and preferences
- **Content**: Educational materials with categorization and tagging
- **Side Effects**: Symptom tracking with severity scales and timestamps
- **Medications**: Dosage tracking, scheduling, and adherence monitoring

### Core Features
1. **Dashboard**: Centralized view of health metrics and quick actions
2. **Symptom Tracker**: Real-time logging of side effects with severity ratings
3. **Medication Reminders**: Schedule management and adherence tracking
4. **Educational Content**: Curated health information with filtering capabilities
5. **Progress Charts**: Visual representation of symptom trends over time
6. **Quick Actions**: Emergency contacts and healthcare provider communication

## Data Flow

1. **User Authentication**: JWT tokens manage session state
2. **API Communication**: RESTful endpoints handle CRUD operations
3. **Real-time Updates**: React Query manages cache invalidation and refetching
4. **Form Handling**: Controlled components with validation
5. **Error Handling**: Comprehensive error boundaries and user feedback

## External Dependencies

### UI and Styling
- Radix UI components for accessibility
- Tailwind CSS for responsive design
- Lucide React for consistent iconography

### Data Management
- TanStack Query for efficient server state management
- React Hook Form with Zod validation (configured but not fully implemented)

### Backend Services
- Drizzle ORM for database operations (PostgreSQL dialect)
- Neon Database for cloud PostgreSQL hosting
- bcryptjs for secure password hashing
- jsonwebtoken for authentication

### Development Tools
- TypeScript for type safety across the stack
- Vite for fast development builds
- ESBuild for production optimization

## Deployment Strategy

### Development Environment
- Replit-optimized configuration with hot module replacement
- In-memory storage for rapid prototyping
- Development-specific error overlays and debugging tools

### Production Considerations
- PostgreSQL database connection via Drizzle ORM
- Environment variable management for sensitive credentials
- Static file serving with optimized builds
- Containerization-ready structure

### Database Strategy
- Drizzle ORM configured for PostgreSQL
- Migration system for schema changes
- Prepared for cloud database deployment (Neon Database recommended)

The application is designed with scalability in mind, using modern development practices and a modular architecture that can easily adapt to growing user needs and feature requirements.