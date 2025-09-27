# ManageWork - Full Stack Application

A modern full-stack application built with React frontend and Node.js backend, featuring user authentication, form validation, and a beautiful UI.

## 🚀 Features

- **Frontend**: React 18, React Router, Tailwind CSS, Zustand state management
- **Backend**: Node.js, Express, PostgreSQL, JWT authentication
- **Authentication**: Secure user registration and login with JWT tokens
- **Form Validation**: Client-side and server-side validation
- **UI/UX**: Responsive design with modern styling
- **Security**: Password hashing, CORS protection, Helmet security headers

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🛠️ Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd my-fullstack-app
```

### 2. Install dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Database Setup

#### Install PostgreSQL
- Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)
- Create a database named `ManageWork`

#### Configure Environment Variables
```bash
# Copy the example environment file
cd backend
cp env.example .env
```

Edit `.env` file with your database credentials:
```env
# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=ManageWork

# Server Configuration
PORT=8888
NODE_ENV=development

# JWT Secret (generate a strong secret)
JWT_SECRET=your_jwt_secret_key_here

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

#### Run Database Migration
```bash
cd backend
npm run setup-db
```

### 4. Start the Application

#### Option 1: Start both frontend and backend (recommended)
```bash
# From root directory
npm start
```

#### Option 2: Start separately
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8888
- **API Documentation**: http://localhost:8888/v1/api/

## 📁 Project Structure

```
my-fullstack-app/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and view engine configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── middlewares/     # Authentication and validation middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic services
│   │   ├── migrations/      # Database migration files
│   │   └── scripts/         # Setup and utility scripts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── stores/         # Zustand state management
│   │   ├── services/        # API services
│   │   └── App.jsx         # Main application component
│   └── package.json
└── package.json            # Root package.json with concurrent scripts
```

## 🔧 API Endpoints

### Authentication
- `POST /v1/api/auth/register` - User registration
- `POST /v1/api/auth/login` - User login
- `GET /v1/api/auth/profile` - Get user profile (protected)

### General
- `GET /v1/api/` - API health check
- `GET /test-db` - Database connection test

## 🎨 Frontend Routes

- `/` - Redirects to login or dashboard based on auth status
- `/login` - User login page
- `/register` - User registration page
- `/dashboard` - User dashboard (protected)

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Both client and server-side validation
- **CORS Protection**: Configured for specific origins
- **Security Headers**: Helmet middleware for security headers
- **SQL Injection Protection**: Parameterized queries with pg

## 🚀 Development

### Backend Development
```bash
cd backend
npm run dev  # Starts with nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm run dev  # Starts Vite development server
```

### Database Management
```bash
cd backend
npm run setup-db  # Run database migrations
```

## 🧪 Testing

### Test API Endpoints
```bash
# Test database connection
curl http://localhost:8888/test-db

# Test API health
curl http://localhost:8888/v1/api/
```

### Test Registration
```bash
curl -X POST http://localhost:8888/v1/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "Password123!",
    "confirmPassword": "Password123!"
  }'
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_USER` | Database username | postgres |
| `DB_PASSWORD` | Database password | - |
| `DB_NAME` | Database name | ManageWork |
| `PORT` | Server port | 8888 |
| `JWT_SECRET` | JWT secret key | - |
| `CORS_ORIGIN` | CORS allowed origin | http://localhost:3000 |

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check database credentials in `.env`
   - Verify database exists

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill existing processes on ports 3000/8888

3. **CORS Errors**
   - Check CORS_ORIGIN in backend `.env`
   - Ensure frontend is running on correct port

4. **JWT Errors**
   - Ensure JWT_SECRET is set in `.env`
   - Use a strong, random secret key

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions, please open an issue in the repository.
