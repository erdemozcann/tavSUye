# tavSUye Platform Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Frontend Structure](#frontend-structure)
4. [Component Library](#component-library)
5. [State Management](#state-management)
6. [API Integration](#api-integration)
7. [Authentication Flow](#authentication-flow)
8. [Admin Features](#admin-features)
9. [Advanced Features](#advanced-features)
10. [Extending the Platform](#extending-the-platform)
11. [Best Practices](#best-practices)

## Introduction

tavSUye is a comprehensive university course feedback platform designed specifically for Sabancı University students. The platform allows students to browse courses, instructors, and programs, read and write reviews, plan their academic journey, and make informed decisions about their education.

This documentation provides an overview of the platform's architecture, components, and guidelines for using and extending the platform.

## Architecture Overview

The tavSUye platform follows a modern client-server architecture:

- **Frontend**: React with TypeScript, using Redux for state management and React Query for data fetching
- **Backend**: Node.js with Express, using PostgreSQL for data storage
- **Authentication**: JWT-based authentication with 2FA support
- **API**: RESTful API with versioning

The frontend and backend are decoupled, communicating solely through the API. This allows for independent development and deployment of each component.

## Frontend Structure

The frontend follows a modular structure:

```
src/
├── assets/          # Static assets (images, icons, etc.)
├── components/      # Reusable UI components
├── hooks/           # Custom React hooks
├── layouts/         # Page layout components
├── pages/           # Page components
│   ├── admin/       # Admin-specific pages
│   └── ...          # Other page categories
├── services/        # API service functions
├── store/           # Redux store configuration and slices
│   └── slices/      # Redux slices
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

### Key Files

- `src/App.tsx`: Main application component with routing
- `src/main.tsx`: Application entry point
- `src/theme.ts`: Material UI theme configuration
- `src/services/api.ts`: API service functions
- `src/store/index.ts`: Redux store configuration

## Component Library

The platform uses Material UI (MUI) as its component library. Key components include:

### Layout Components
- `MainLayout`: Main application layout with navigation
- `AdminDashboard`: Admin dashboard layout

### Form Components
- Form fields with validation using Formik and Yup
- Custom form components for specific data types

### Data Display Components
- Tables with pagination, sorting, and filtering
- Cards for displaying course, instructor, and program information
- Charts for displaying statistics (admin dashboard)

## State Management

The platform uses Redux for global state management and React Query for server state:

### Redux Store
- `auth`: Authentication state (user, token, etc.)
- `ui`: UI state (theme, notifications, etc.)
- `settings`: User settings

### React Query
Used for fetching and caching API data:
- Courses, instructors, programs
- User data
- Admin statistics

## API Integration

API services are organized in the `services/api.ts` file:

```typescript
// Auth endpoints
export const authApi = {
  register: (userData: Partial<User>) => 
    api.post<AuthResponse>('/auth/register', userData).then(extractData),
  login: (usernameOrEmail: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { usernameOrEmail, password }).then(extractData),
  // ...
};

// Course endpoints
export const courseApi = {
  getAllCourses: () =>
    api.get<Course[]>('/courses').then(extractData),
  getCourse: (subject: string, courseCode: string) =>
    api.get<Course>(`/courses/${subject}-${courseCode}`).then(extractData),
  // ...
};

// Additional API services...
```

## Authentication Flow

The platform implements a comprehensive authentication flow:

1. **Registration**:
   - User submits registration form with Sabancı University email
   - Backend sends verification email
   - User verifies email to activate account

2. **Login**:
   - User submits login form with username/email and password
   - If 2FA is enabled, user is prompted for verification code
   - On successful authentication, user profile is loaded

3. **Password Reset**:
   - User requests password reset with email
   - Backend sends password reset link
   - User sets new password

## Admin Features

The admin section provides comprehensive management tools:

### Dashboard
- Platform statistics and analytics
- User activity monitoring

### Course Management
- Add, edit, and replace courses
- View course details and statistics

### Instructor Management
- Add and edit instructor information
- View instructor details and statistics

### User Management
- View all users
- Ban/unban users

### Comment Moderation
- Review reported comments
- Delete inappropriate comments

### System Settings
- Configure platform settings
- Manage registration and authentication options

## Advanced Features

The platform includes several advanced features to enhance the user experience:

### Student Plan Management
- Create and manage academic plans
- Add/remove courses from plans
- View course details within plans
- Track academic progress

### Advanced Search and Filtering
- Course search with multiple filters:
  - Faculty filter
  - Credit range filter
  - Subject filter
  - Multiple sorting options
- Instructor search with filters:
  - Department filter
  - Multiple sorting options
  - Name search

### Course Notes and Materials
- Upload course notes and materials
- View and download shared notes
- Support for multiple file types (PDF, DOC, PPT, etc.)
- Delete own uploaded files

## Extending the Platform

### Adding a New Feature

1. **Define Types**: Add necessary types in `types/index.ts`
2. **Create API Services**: Add API services in `services/api.ts`
3. **Create Components**: Create necessary UI components
4. **Add Redux State**: If needed, add Redux state management
5. **Create Pages**: Create page components and add routes in `App.tsx`

### Adding a New Admin Feature

1. Follow the steps above for adding a new feature
2. Add a new route in the admin section of `App.tsx`
3. Add a new card to the admin dashboard in `pages/admin/AdminDashboard.tsx`

## Best Practices

### Code Style
- Use TypeScript for type safety
- Follow the existing component structure
- Use functional components with hooks
- Keep components small and focused

### State Management
- Use Redux only for global state
- Use React Query for API data
- Use local state for component-specific state

### Performance
- Implement pagination for large data sets
- Use React.memo for expensive components
- Optimize API calls with React Query caching

### Security
- Never store sensitive data in local storage
- Validate all user inputs
- Implement proper authorization checks
- Use HTTPS for all API calls 