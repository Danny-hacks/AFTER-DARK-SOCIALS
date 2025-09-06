# Summer Beats Festival Landing Page

## Overview

This is a modern, single-page application for a music festival called "Summer Beats Festival 2024". The application serves as a landing page showcasing event information, ticket sales, location details, and contact information. Built with React and TypeScript, it features a responsive design with smooth scrolling navigation and interactive components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework Choice**: React 18 with TypeScript in a single-page application (SPA) structure
- **Rationale**: React provides excellent component reusability and state management for interactive UI elements
- **Routing**: Uses Wouter for lightweight client-side routing, though the app is primarily single-page with smooth scroll navigation
- **Build Tool**: Vite for fast development and optimized production builds

**UI Component System**: Radix UI primitives with shadcn/ui design system
- **Rationale**: Provides accessible, unstyled components that can be customized while maintaining accessibility standards
- **Styling**: Tailwind CSS with custom CSS variables for theming, configured for dark mode support
- **Design Tokens**: Custom color scheme with gradient effects and consistent spacing/typography

**State Management**: React Query (TanStack Query) for server state management
- **Rationale**: Handles caching, background updates, and error states for API calls
- **Local State**: React hooks (useState, useEffect) for component-level state

### Backend Architecture

**Server Framework**: Express.js with TypeScript
- **Rationale**: Minimal setup for serving the SPA and potential API endpoints
- **Development**: Hot reload with Vite integration for seamless development experience
- **Static Serving**: Serves the built React application in production

**Database Layer**: Configured for PostgreSQL with Drizzle ORM
- **Schema**: User management schema defined in shared directory
- **Type Safety**: Drizzle provides end-to-end type safety from database to frontend
- **Migrations**: Drizzle Kit handles database migrations and schema evolution

**Storage Interface**: Abstracted storage layer with in-memory implementation
- **Rationale**: Allows switching between different storage backends (memory, database) without changing business logic
- **Methods**: Basic CRUD operations for user management

### Data Architecture

**Shared Types**: Common TypeScript interfaces in shared directory
- **User Schema**: Drizzle schema with Zod validation for type safety
- **Validation**: Zod schemas for runtime type checking and form validation

**Form Handling**: React Hook Form with Zod resolvers
- **Rationale**: Provides performant forms with built-in validation and error handling

### Development Tools

**Build System**: 
- **Frontend**: Vite with React plugin and TypeScript support
- **Backend**: esbuild for production bundling with ESM output

**Code Quality**:
- **TypeScript**: Strict mode enabled for maximum type safety
- **Path Mapping**: Absolute imports configured for cleaner code organization

## External Dependencies

### UI and Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives (accordion, dialog, dropdown, etc.)
- **tailwindcss**: Utility-first CSS framework for rapid UI development
- **class-variance-authority**: Type-safe variant API for component styling
- **lucide-react**: Consistent icon library for UI elements

### Data Management
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Performant form library with minimal re-renders
- **@hookform/resolvers**: Validation resolvers for form integration

### Database and Validation
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **drizzle-zod**: Integration between Drizzle schemas and Zod validation
- **@neondatabase/serverless**: PostgreSQL database connection for serverless environments
- **zod**: TypeScript-first schema validation library

### Development and Build Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking and enhanced developer experience
- **wouter**: Minimalist routing library for React applications

### Additional Features
- **date-fns**: Modern date utility library for date formatting and manipulation
- **embla-carousel-react**: Smooth carousel/slider component for image galleries
- **cmdk**: Command palette component for enhanced user interactions