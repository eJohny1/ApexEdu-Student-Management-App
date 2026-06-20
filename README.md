# 🏆 ApexEdu Student Management System

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Express](https://img.shields.io/badge/Express-4.x-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.x-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

A full-stack student management system built with Node.js, Express, and PostgreSQL. Features a RESTful API backend and a modern, responsive dashboard frontend.

---

## 📚 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## 📖 About

**ApexEdu** is a complete student management solution designed to help educational institutions efficiently manage students, courses, and academic progress. Built with modern technologies, it provides a clean, intuitive interface for administrators to handle all aspects of student management.

---

## ✨ Features

### Backend Features
- ✅ **Student CRUD** - Create, Read, Update, Delete students
- ✅ **Course CRUD** - Create, Read, Update, Delete courses
- ✅ **Search Students** - Search by name, email, or course
- ✅ **Dashboard Stats** - Real-time statistics (total students, active courses, graduates, success rate)
- ✅ **Professional Logging** - Winston logging with file and console output
- ✅ **HTTP Logging** - Morgan for request logging
- ✅ **Health Checks** - Basic and detailed health endpoints
- ✅ **CORS Enabled** - Secure cross-origin requests
- ✅ **Environment Variables** - Secure configuration with dotenv

### Frontend Features
- ✅ **Modern Dashboard** - Dark theme with "Midnight Aurora" design
- ✅ **Responsive Layout** - Works on desktop and mobile
- ✅ **Student Management** - Add, edit, delete students
- ✅ **Course Management** - Add, edit, delete courses
- ✅ **Live Search** - Instant student search with debouncing
- ✅ **Dashboard Cards** - Real-time statistics
- ✅ **Modal Forms** - Clean and intuitive forms
- ✅ **Notifications** - Success, error, warning, info messages
- ✅ **Loading States** - Spinner during API calls

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18.x+ | Runtime environment |
| Express | 4.x | Web framework |
| PostgreSQL | 16.x | Database |
| pg | 8.x | PostgreSQL driver |
| Winston | 3.x | Logging |
| Morgan | 1.x | HTTP logging |
| Cors | 2.x | CORS handling |
| Dotenv | 16.x | Environment variables |

### Frontend
| Technology | Purpose |
|------------|---------|
| HTML5 | Structure |
| CSS3 | Styling (Custom "Midnight Aurora" theme) |
| Vanilla JavaScript | Logic and API calls |
| Font Awesome | Icons |

---

## 📁 Project Structure

```
ApexEdu-Student-Management-App/
├── Backend/
│   ├── config/
│   │   └── db.js              # PostgreSQL connection
│   ├── .env                    # Environment variables
│   ├── .gitignore              # Git ignore file
│   ├── package.json            # Dependencies
│   └── server.js               # Main server file
├── Frontend/
│   ├── index.html              # Dashboard HTML
│   ├── script.js               # Frontend JavaScript
│   └── styles.css              # Custom CSS (Midnight Aurora)
├── .gitignore                  # Root git ignore
├── LICENSE                     # MIT License
└── README.md                   # This file
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Welcome message |
| `GET` | `/health` | Basic health check |
| `GET` | `/health/detailed` | Detailed health check |
| `GET` | `/api/students` | Get all students |
| `GET` | `/api/students/:id` | Get single student |
| `POST` | `/api/students` | Create a student |
| `PUT` | `/api/students/:id` | Update a student |
| `DELETE` | `/api/students/:id` | Delete a student |
| `GET` | `/api/students/search?q=` | Search students |
| `GET` | `/api/courses` | Get all courses |
| `GET` | `/api/courses/:id` | Get single course |
| `POST` | `/api/courses` | Create a course |
| `PUT` | `/api/courses/:id` | Update a course |
| `DELETE` | `/api/courses/:id` | Delete a course |
| `GET` | `/api/dashboard/stats` | Dashboard statistics |

---

## 💻 Installation

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v16 or higher)
- Git (optional)

### Step 1: Clone the Repository

```bash
git clone https://github.com/eJohny1/ApexEdu-Student-Management-App.git
cd ApexEdu-Student-Management-App
```

### Step 2: Set Up PostgreSQL Database

1. Open pgAdmin or psql
2. Create a new database:
```sql
CREATE DATABASE studentdb;
```

3. Create the tables:
```sql
-- Create courses table
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    duration INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create students table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    course VARCHAR(100) NOT NULL,
    enrollment_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_students_name ON students(name);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_course ON students(course);
CREATE INDEX idx_courses_name ON courses(name);
```

### Step 3: Set Up Backend

```bash
cd Backend
npm install
```

### Step 4: Configure Environment Variables

Create a `.env` file in the `Backend/` folder:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=studentdb
NODE_ENV=development
```

**Important:** Replace `your_password` with your actual PostgreSQL password.

---

## 🚀 Running the Application

### Start the Backend Server

```bash
cd Backend
npm run dev
```

**Expected output:**
```
✅ Connected to PostgreSQL
🚀 ApexEdu Server running on http://localhost:5000
📚 API: http://localhost:5000/api/students
📖 Courses: http://localhost:5000/api/courses
📊 Dashboard: http://localhost:5000/api/dashboard/stats
❤️ Health: http://localhost:5000/health
🏠 Welcome: http://localhost:5000/
```

### Open the Frontend

1. Open `Frontend/index.html` in your browser
2. Or use Live Server in VS Code

---

## 🧪 Testing the API

### Using cURL (Command Line)

```bash
# Get all students
curl http://localhost:5000/api/students

# Get all courses
curl http://localhost:5000/api/courses

# Create a student
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice Johnson","email":"alice@example.com","course":"Computer Science","enrollmentDate":"2024-06-20","status":"active"}'

# Search students
curl "http://localhost:5000/api/students/search?q=john"

# Dashboard stats
curl http://localhost:5000/api/dashboard/stats
```

### Using Postman

| Request | URL | Method |
|---------|-----|--------|
| Get all students | `http://localhost:5000/api/students` | GET |
| Create student | `http://localhost:5000/api/students` | POST |
| Get student | `http://localhost:5000/api/students/1` | GET |
| Update student | `http://localhost:5000/api/students/1` | PUT |
| Delete student | `http://localhost:5000/api/students/1` | DELETE |

---

## 🎨 Design Features

### "Midnight Aurora" Theme

The frontend features a custom dark theme with:

- **Primary Color:** Purple (#6C3CE1)
- **Secondary Color:** Mint Green (#00D4AA)
- **Accent Color:** Coral (#FF6B6B)
- **Background:** Deep Navy (#0A0E1A, #141B2D)
- **Glass effects** and smooth animations
- **Fully responsive** design

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Commit: `git commit -m "Add your feature"`
5. Push: `git push origin feature/your-feature`
6. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**eJohny1**

- GitHub: [@eJohny1](https://github.com/eJohny1)
- Project Link: [ApexEdu-Student-Management-App](https://github.com/eJohny1/ApexEdu-Student-Management-App)

---

## 🙏 Acknowledgments

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Font Awesome](https://fontawesome.com/)

---

## 📊 Project Status

- ✅ Backend API - Complete
- ✅ Frontend Dashboard - Complete
- ✅ PostgreSQL Integration - Complete
- ✅ CRUD Operations - Complete
- ✅ Search Functionality - Complete
- ✅ Dashboard Stats - Complete
- ✅ Logging System - Complete
- ✅ Documentation - Complete

---

## 🌟 Show Your Support

If you found this project helpful, please give it a ⭐ on GitHub!

---

**Made with ❤️ by eJohny1**

---

*Rise to the Top with ApexEdu 🏆*