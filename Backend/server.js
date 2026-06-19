const express = require("express");
const cors = require("cors");
require("dotenv").config();
const morgan = require("morgan");
const winston = require("winston");
const pool = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

//  Logger Configuration 
const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: "error.log", level: "error" }),
        new winston.transports.File({ filename: "combined.log" }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        }),
    ],
});

app.use(morgan(":method :url :status :response-time ms - :res[content-length]"));

// Custom API Logger Middleware
const apiLogger = (req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        logger.info({
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration: `${duration}ms`,
            params: req.params,
            query: req.query,
            body: req.method !== "GET" ? req.body : undefined,
        });
    });
    next();
};

app.use(apiLogger);

//  Error Handling Middleware 
app.use((err, req, res, next) => {
    logger.error({
        message: err.message,
        stack: err.stack,
        method: req.method,
        path: req.path,
        params: req.params,
        query: req.query,
        body: req.method !== "GET" ? req.body : undefined,
    });

    res.status(500).json({ message: "Internal server error" });
});

//  Welcome Route 
app.get('/', (req, res) => {
    res.json({
        message: 'ApexEdu Student Management App',  
        version: '1.0.0',
        endpoints: {
            students: '/api/students',
            courses: '/api/courses',
            search: '/api/students/search?q=query',
            dashboard: '/api/dashboard/stats',
            health: '/health'
        }
    });
});

//  Course Routes 

// GET all courses
app.get('/api/courses', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM courses ORDER BY name ASC'
        );
        logger.info(`Retrieved ${result.rows.length} courses successfully`);
        res.json(result.rows);
    } catch (error) {
        logger.error("Error fetching courses:", error);
        res.status(500).json({ message: error.message });
    }
});

// GET single course
app.get("/api/courses/:id", async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM courses WHERE id = $1',
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Course not found" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        logger.error("Error fetching course:", error);
        res.status(500).json({ message: error.message });
    }
});

// POST create course
app.post("/api/courses", async (req, res) => {
    try {
        const { name, description, duration, status } = req.body;
        const result = await pool.query(
            `INSERT INTO courses (name, description, duration, status)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [name, description, duration, status || 'active']
        );
        const newCourse = result.rows[0];
        logger.info("New course created:", {
            courseId: newCourse.id,
            name: newCourse.name,
        });
        res.status(201).json(newCourse);
    } catch (error) {
        logger.error("Error creating course:", error);
        if (error.code === '23505') { // Unique violation
            return res.status(400).json({ message: "Course name already exists" });
        }
        res.status(400).json({ message: error.message });
    }
});

// PUT update course
app.put("/api/courses/:id", async (req, res) => {
    try {
        const { name, description, duration, status } = req.body;
        const result = await pool.query(
            `UPDATE courses 
             SET name = $1, description = $2, duration = $3, status = $4, updated_at = CURRENT_TIMESTAMP
             WHERE id = $5
             RETURNING *`,
            [name, description, duration, status, req.params.id]
        );
        if (result.rows.length === 0) {
            logger.warn("Course not found for update:", { courseId: req.params.id });
            return res.status(404).json({ message: "Course not found" });
        }
        const updatedCourse = result.rows[0];
        logger.info("Course updated successfully:", {
            courseId: updatedCourse.id,
            name: updatedCourse.name,
        });
        res.json(updatedCourse);
    } catch (error) {
        logger.error("Error updating course:", error);
        if (error.code === '23505') {
            return res.status(400).json({ message: "Course name already exists" });
        }
        res.status(400).json({ message: error.message });
    }
});

// DELETE course
app.delete("/api/courses/:id", async (req, res) => {
    try {
        // Check if course has enrolled students
        const studentCheck = await pool.query(
            'SELECT COUNT(*) FROM students WHERE course = (SELECT name FROM courses WHERE id = $1)',
            [req.params.id]
        );
        const enrolledStudents = parseInt(studentCheck.rows[0].count);

        if (enrolledStudents > 0) {
            logger.warn("Attempted to delete course with enrolled students:", {
                courseId: req.params.id,
                enrolledStudents,
            });
            return res
                .status(400)
                .json({ message: "Cannot delete course with enrolled students" });
        }

        const result = await pool.query(
            'DELETE FROM courses WHERE id = $1 RETURNING *',
            [req.params.id]
        );
        if (result.rows.length === 0) {
            logger.warn("Course not found for deletion:", {
                courseId: req.params.id,
            });
            return res.status(404).json({ message: "Course not found" });
        }
        const deletedCourse = result.rows[0];
        logger.info("Course deleted successfully:", {
            courseId: deletedCourse.id,
            name: deletedCourse.name,
        });
        res.json({ message: "Course deleted successfully" });
    } catch (error) {
        logger.error("Error deleting course:", error);
        res.status(500).json({ message: error.message });
    }
});

//  Student Routes 

// GET all students
app.get("/api/students", async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM students ORDER BY created_at DESC'
        );
        logger.info(`Retrieved ${result.rows.length} students successfully`);
        res.json(result.rows);
    } catch (error) {
        logger.error("Error fetching students:", error);
        res.status(500).json({ message: error.message });
    }
});

// GET single student
app.get('/api/students/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM students WHERE id = $1',
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        logger.error('Error fetching student:', error);
        res.status(500).json({ message: error.message });
    }
});

// POST create student
app.post("/api/students", async (req, res) => {
    try {
        const { name, email, course, enrollmentDate, status } = req.body;
        const result = await pool.query(
            `INSERT INTO students (name, email, course, enrollment_date, status)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [name, email, course, enrollmentDate || new Date(), status || 'active']
        );
        const newStudent = result.rows[0];
        logger.info("New student created:", {
            studentId: newStudent.id,
            name: newStudent.name,
            course: newStudent.course,
        });
        res.status(201).json(newStudent);
    } catch (error) {
        logger.error("Error creating student:", error);
        if (error.code === '23505') { // Unique violation
            return res.status(400).json({ message: "Email already exists" });
        }
        res.status(400).json({ message: error.message });
    }
});

// PUT update student
app.put("/api/students/:id", async (req, res) => {
    try {
        const { name, email, course, enrollmentDate, status } = req.body;
        const result = await pool.query(
            `UPDATE students 
             SET name = $1, email = $2, course = $3, enrollment_date = $4, status = $5, updated_at = CURRENT_TIMESTAMP
             WHERE id = $6
             RETURNING *`,
            [name, email, course, enrollmentDate, status, req.params.id]
        );
        if (result.rows.length === 0) {
            logger.warn("Student not found for update:", {
                studentId: req.params.id,
            });
            return res.status(404).json({ message: "Student not found" });
        }
        const updatedStudent = result.rows[0];
        logger.info("Student updated successfully:", {
            studentId: updatedStudent.id,
            name: updatedStudent.name,
            course: updatedStudent.course,
        });
        res.json(updatedStudent);
    } catch (error) {
        logger.error("Error updating student:", error);
        if (error.code === '23505') {
            return res.status(400).json({ message: "Email already exists" });
        }
        res.status(400).json({ message: error.message });
    }
});

// DELETE student
app.delete("/api/students/:id", async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM students WHERE id = $1 RETURNING *',
            [req.params.id]
        );
        if (result.rows.length === 0) {
            logger.warn("Student not found for deletion:", {
                studentId: req.params.id,
            });
            return res.status(404).json({ message: "Student not found" });
        }
        const deletedStudent = result.rows[0];
        logger.info("Student deleted successfully:", {
            studentId: deletedStudent.id,
            name: deletedStudent.name,
            course: deletedStudent.course,
        });
        res.json({ message: "Student deleted successfully" });
    } catch (error) {
        logger.error("Error deleting student:", error);
        res.status(500).json({ message: error.message });
    }
});

// SEARCH students
app.get("/api/students/search", async (req, res) => {
    try {
        const searchTerm = req.query.q;
        logger.info("Student search initiated:", { searchTerm });

        const result = await pool.query(
            `SELECT * FROM students 
             WHERE name ILIKE $1 
                OR email ILIKE $1 
                OR course ILIKE $1
             ORDER BY created_at DESC`,
            [`%${searchTerm}%`]
        );

        logger.info("Student search completed:", {
            searchTerm,
            resultsCount: result.rows.length,
        });
        res.json(result.rows);
    } catch (error) {
        logger.error("Error searching students:", error);
        res.status(500).json({ message: error.message });
    }
});

//  Dashboard Stats 

app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const stats = await getDashboardStats();
        logger.info('Dashboard statistics retrieved successfully:', stats);
        res.json(stats);
    } catch (error) {
        logger.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: error.message });
    }
});

// Helper function for dashboard stats
async function getDashboardStats() {
    // Get total students
    const totalStudentsResult = await pool.query('SELECT COUNT(*) FROM students');
    const totalStudents = parseInt(totalStudentsResult.rows[0].count);

    // Get active students
    const activeStudentsResult = await pool.query(
        'SELECT COUNT(*) FROM students WHERE status = $1',
        ['active']
    );
    const activeStudents = parseInt(activeStudentsResult.rows[0].count);

    // Get total courses
    const totalCoursesResult = await pool.query('SELECT COUNT(*) FROM courses');
    const totalCourses = parseInt(totalCoursesResult.rows[0].count);

    // Get active courses
    const activeCoursesResult = await pool.query(
        'SELECT COUNT(*) FROM courses WHERE status = $1',
        ['active']
    );
    const activeCourses = parseInt(activeCoursesResult.rows[0].count);

    // Get graduates (inactive students)
    const graduatesResult = await pool.query(
        'SELECT COUNT(*) FROM students WHERE status = $1',
        ['inactive']
    );
    const graduates = parseInt(graduatesResult.rows[0].count);

    // Get course counts (group by course)
    const courseCountsResult = await pool.query(
        'SELECT course, COUNT(*) as count FROM students GROUP BY course'
    );
    const courseCounts = courseCountsResult.rows.map(row => ({
        _id: row.course,
        count: parseInt(row.count)
    }));

    // Calculate success rate
    const successRate = totalStudents > 0 
        ? Math.round((graduates / totalStudents) * 100) 
        : 0;

    return {
        totalStudents,
        activeStudents,
        totalCourses,
        activeCourses,
        graduates,
        courseCounts,
        successRate
    };
}

//  Health Check Endpoints 

// Basic health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        timestamp: new Date(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Detailed health check
app.get('/health/detailed', async (req, res) => {
    try {
        // Check PostgreSQL connection
        const dbResult = await pool.query('SELECT NOW()');
        const dbStatus = dbResult.rows.length > 0 ? 'Connected' : 'Disconnected';

        // Get system metrics
        const systemInfo = {
            memory: {
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                unit: 'MB'
            },
            uptime: {
                seconds: Math.round(process.uptime()),
                formatted: formatUptime(process.uptime())
            },
            nodeVersion: process.version,
            platform: process.platform,
            database: 'PostgreSQL'
        };

        const healthCheck = {
            status: 'UP',
            timestamp: new Date(),
            database: {
                status: dbStatus,
                name: 'PostgreSQL',
                host: process.env.DB_HOST
            },
            system: systemInfo,
            environment: process.env.NODE_ENV || 'development'
        };

        res.status(200).json(healthCheck);
    } catch (error) {
        res.status(500).json({
            status: 'DOWN',
            timestamp: new Date(),
            error: error.message
        });
    }
});

//  Helper Functions 

// Helper function to format uptime
function formatUptime(seconds) {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (remainingSeconds > 0) parts.push(`${remainingSeconds}s`);

    return parts.join(' ');
}

//  Start Server

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 ApexEdu Server running on http://localhost:${PORT}`);
    console.log(`📚 API: http://localhost:${PORT}/api/students`);
    console.log(`📖 Courses: http://localhost:${PORT}/api/courses`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/api/dashboard/stats`);
    console.log(`❤️ Health: http://localhost:${PORT}/health`);
    console.log(`🏠 Welcome: http://localhost:${PORT}/`);
});