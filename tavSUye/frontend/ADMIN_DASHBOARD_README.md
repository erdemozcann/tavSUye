# Admin Dashboard Documentation

## Overview

The tavSUye Admin Dashboard provides comprehensive administrative functionality for managing the university course feedback system. The dashboard includes both basic admin operations and advanced management features.

## Features

### 1. Main Admin Dashboard (`/admin`)

The main admin dashboard provides an overview of the system and quick access to all administrative functions.

**Features:**
- **Admin Console**: Quick access to basic admin operations
  - Add Course
  - Change Course  
  - Add Instructor
- **Advanced Admin Management**: Access to comprehensive management tools
  - Course Management
  - Instructor Management
  - User Management
  - Comment Moderation
  - System Settings
  - Analytics Dashboard
- **Analytics Section**: 
  - Top 10 visited courses (last 30 days)
  - Top 10 visited instructors (last 30 days)
- **Main Actions**: Navigation to core application features

### 2. Basic Admin Operations

#### Add Course (`/admin/add-course`)
- Add new courses to the system
- Required fields: Subject, Course Code, Course Name (English), Faculty
- Optional fields: Turkish name, credits, content, links
- Faculty options: FASS, FMAN, FENS, SL
- Course status toggle (active/inactive)

#### Change Course (`/admin/change-course`)
- Deactivate old courses and transfer comments to new courses
- Select old and new courses by subject and code
- Automatic comment transfer with "From {old course}:" prefix
- Warning system for irreversible actions

#### Add Instructor (`/admin/add-instructor`)
- Add new instructors to the system
- Required fields: Name, Surname, Department
- Optional fields: Image URL, About (Turkish/English), Links (Turkish/English)

### 3. Advanced Admin Management

#### Course Management (`/admin/dashboard/courses`)
- Comprehensive course management interface
- Add, edit, and delete courses
- Bulk operations
- Advanced filtering and search
- Course status management

#### Instructor Management (`/admin/dashboard/instructors`)
- Manage instructor profiles
- Update instructor information
- Profile image management
- Department assignments

#### User Management (`/admin/dashboard/users`)
- View all system users
- Ban/unban users with reasons
- Update user roles
- User activity monitoring

#### Comment Moderation (`/admin/dashboard/comments`)
- Review all user comments
- Delete inappropriate comments
- Approve pending comments
- Bulk moderation actions

#### System Settings (`/admin/dashboard/settings`)
- Configure system parameters
- Update application settings
- Manage system-wide preferences

#### Analytics Dashboard (`/admin/dashboard/stats`)
- Detailed platform statistics
- User engagement metrics
- Course popularity analytics
- Instructor performance data

## API Endpoints

### Course Management
- `POST /api/courses/add` - Add new course
- `PUT /api/courses/{id}` - Update course
- `DELETE /api/courses/{id}` - Delete course
- `POST /api/admin/change-course` - Change course with comment transfer

### Instructor Management
- `POST /api/instructors/add` - Add new instructor
- `PUT /api/instructors/{id}` - Update instructor
- `DELETE /api/instructors/{id}` - Delete instructor

### User Management
- `GET /api/admin/users` - Get all users
- `POST /api/admin/ban-user` - Ban user
- `POST /api/admin/unban-user` - Unban user
- `PUT /api/admin/users/{id}/role` - Update user role

### Comment Moderation
- `GET /api/admin/comments` - Get all comments
- `DELETE /api/admin/comments/{id}` - Delete comment
- `PUT /api/admin/comments/{id}/approve` - Approve comment

### System Settings
- `GET /api/admin/settings` - Get system settings
- `PUT /api/admin/settings` - Update system settings

### Analytics
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/stats/users` - Get user statistics
- `GET /api/admin/stats/courses` - Get course statistics
- `GET /api/admin/stats/instructors` - Get instructor statistics

## Navigation Structure

```
/admin
├── / (Main Dashboard)
├── /add-course (Add Course Form)
├── /change-course (Change Course Form)
├── /add-instructor (Add Instructor Form)
└── /dashboard (Advanced Admin)
    ├── /courses (Course Management)
    ├── /instructors (Instructor Management)
    ├── /users (User Management)
    ├── /comments (Comment Moderation)
    ├── /settings (System Settings)
    └── /stats (Analytics Dashboard)
```

## Security & Permissions

- All admin routes are protected and require authentication
- Admin role verification is performed on the backend
- Sensitive operations require additional confirmation
- Audit logging for all administrative actions

## Usage Guidelines

### For Basic Operations:
1. Navigate to `/admin` for the main dashboard
2. Use the Admin Console section for quick operations
3. Follow the guided forms for adding courses/instructors

### For Advanced Management:
1. Access the Advanced Admin Management section
2. Choose the appropriate management tool
3. Use the comprehensive interfaces for detailed operations

### Best Practices:
- Always review changes before confirming
- Use the analytics dashboard to monitor system health
- Regularly moderate comments to maintain quality
- Keep instructor and course information up to date

## Technical Implementation

### Frontend Components:
- `AdminDashboard.tsx` - Main dashboard with navigation
- `AdminAddCourse.tsx` - Course addition form
- `AdminChangeCourse.tsx` - Course change interface
- `AdminAddInstructor.tsx` - Instructor addition form
- Advanced components in `/pages/admin/` directory

### API Services:
- `adminApi` object in `services/api.ts`
- Comprehensive error handling
- Consistent response formatting
- Authentication integration

### Routing:
- Protected routes with role-based access
- Nested routing for advanced features
- Breadcrumb navigation support

## Troubleshooting

### Common Issues:
1. **403 Forbidden**: Check admin role permissions
2. **API Errors**: Verify backend connectivity
3. **Form Validation**: Ensure all required fields are filled
4. **Navigation Issues**: Clear browser cache and reload

### Support:
For technical support or feature requests, contact the development team. 