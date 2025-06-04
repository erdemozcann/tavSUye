# tavSUye - University Course Feedback Platform

tavSUye is a comprehensive university course feedback platform designed specifically for Sabancı University students. The platform allows students to browse courses, instructors, and programs, read and write reviews, plan their academic journey, and make informed decisions about their education.

## Features

### User Features
- **Authentication**
  - Register with Sabancı University email
  - Email verification
  - Two-factor authentication
  - Login/logout
  - Password reset

- **Course Management**
  - Browse all courses
  - View detailed course information
  - Read and write course reviews
  - Filter courses by various criteria
  - Rate courses on difficulty, usefulness, etc.

- **Instructor Management**
  - Browse all instructors
  - View instructor profiles
  - Read and write instructor reviews
  - Rate instructors on teaching quality, helpfulness, etc.

- **Program Management**
  - Browse academic programs
  - View program requirements and details

- **Student Planning**
  - Create and manage academic plans
  - Add/remove courses from plans
  - Track progress towards graduation

- **Profile Management**
  - Update personal information
  - Manage notification preferences
  - Enable/disable 2FA

### Admin Features
- **Dashboard**
  - View platform statistics and analytics
  - Monitor user activity

- **Course Management**
  - Add, edit, and delete courses
  - Replace courses with newer versions

- **Instructor Management**
  - Add, edit, and delete instructors
  - Manage instructor information

- **User Management**
  - View all users
  - Ban/unban users
  - Manage user roles

- **Comment Moderation**
  - Review reported comments
  - Delete inappropriate comments

- **System Settings**
  - Configure platform settings
  - Manage registration options
  - Set comment moderation rules

## Technology Stack

### Frontend
- React with TypeScript
- Redux for state management
- React Query for data fetching
- Material UI for UI components
- Formik and Yup for form validation
- React Router for routing

### Backend
- Node.js with Express
- PostgreSQL database
- JWT for authentication
- bcrypt for password hashing

## Getting Started

### Prerequisites
- Node.js (v16 or later)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/tavSUye.git
   cd tavSUye
   ```

2. Install frontend dependencies
   ```
   cd frontend
   npm install
   ```

3. Install backend dependencies
   ```
   cd ../backend
   npm install
   ```

4. Set up environment variables
   - Create a `.env` file in the backend directory
   - Add necessary environment variables (see `.env.example`)

5. Start the development servers

   Frontend:
   ```
   cd frontend
   npm run dev
   ```

   Backend:
   ```
   cd backend
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
tavSUye/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   └── ...
│   │   ├── services/
│   │   ├── store/
│   │   ├── types/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.ts
└── backend/
    ├── src/
    │   ├── controllers/
    │   ├── middleware/
    │   ├── models/
    │   ├── routes/
    │   └── utils/
    ├── package.json
    └── tsconfig.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Sabancı University for inspiration
- All contributors who have helped build this platform
