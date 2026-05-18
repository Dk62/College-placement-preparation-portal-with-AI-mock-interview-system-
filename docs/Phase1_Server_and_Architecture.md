# College Placement Preparation Portal
## Developer Documentation Book
---

# Phase 1: Core System & Architecture
## Chapter 1: The Backend Bootstrapper (`server.js`)

### 1.1 Overview and Purpose
The `server.js` file acts as the central nervous system of the entire backend infrastructure. It is the primary entry point for the Node.js process and is responsible for:
1. Bootstrapping the Express HTTP server.
2. Securing the application with multiple layers of middleware (CORS, Helmet, Rate Limiting).
3. Safely injecting localized environment variables into the application scope.
4. Initializing and verifying the core MySQL Database connection prior to accepting traffic.
5. Binding all modular routing controllers into the unified REST API namespace (`/api/*`).

### 1.2 The Source Code with Comments
Below is the exact implementation of the `server.js` file with added inline documentation to clarify the architecture.

```javascript
// =======================================================
// CORE DEPENDENCIES
// =======================================================
const express = require('express');
const cors = require('cors');           // Handles Cross-Origin Resource Sharing
const helmet = require('helmet');       // Secures HTTP headers
const morgan = require('morgan');       // Logs incoming HTTP requests
const cookieParser = require('cookie-parser'); // Parses secure JWT Cookies
const dotenv = require('dotenv');       // Loads environment variables
const mysql = require('mysql2/promise');// Handles low-level MySQL commands

// Mount the .env configurations immediately
dotenv.config();

// Initialize the Express runtime
const app = express();

// =======================================================
// GLOBAL MIDDLEWARE STACK
// =======================================================
// Parses incoming JSON payloads and URL-encoded strings
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enables the server to read 'token' cookies attached to incoming requests
app.use(cookieParser());

// Dynamic CORS Configuration
// This is critical for connecting a Vercel-hosted frontend to a Railway-hosted backend.
app.use(cors({
  origin: function (origin, callback) {
    // 1. Allow headless clients (Postman, Mobile Apps)
    if (!origin) return callback(null, true);
    
    // 2. White-listed URLs
    const allowedOrigins = ['http://localhost:5173', process.env.FRONTEND_URL];
    
    // 3. Dynamic sub-domain matching for Vercel deploy previews
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    // Block unauthorized domains to prevent cross-site request forgery
    return callback(new Error('CORS blocked cross-origin request'), false);
  },
  credentials: true // Forces cookies to be passed between cross-origin requests
}));

// Apply basic security headers
app.use(helmet());
// Log API requests to the console (dev mode)
app.use(morgan('dev'));


// =======================================================
// ROUTE MOUNTING
// =======================================================
// Import isolated route modules
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const driveRoutes = require('./routes/driveRoutes');
const testRoutes = require('./routes/testRoutes');
const mockRoutes = require('./routes/mockRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const tpoRoutes = require('./routes/tpoRoutes');
const companyRoutes = require('./routes/companyRoutes');

// Bind route modules to specific URL prefixes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/drives', driveRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/mock', mockRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tpo', tpoRoutes);
app.use('/api/company', companyRoutes);

// System Healthcheck Endpoint (Used by Railway/Render to verify uptime)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;


// =======================================================
// DATABASE INITIALIZATION & SERVER BOOTSTRAP
// =======================================================
const init = async () => {
  try {
    // STEP 1: Ensure Database Physical Existence
    // ---------------------------------------------------
    // This low-level connection guarantees that the database name exists 
    // before the Sequelize ORM attempts to build tables.
    const connection = await mysql.createConnection({
      host: process.env.MYSQLHOST || process.env.DB_HOST,
      port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
      user: process.env.MYSQLUSER || process.env.DB_USER,
      password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
    });
    
    const targetDbName = process.env.MYSQLDATABASE || process.env.DB_NAME;
    
    // We wrap this in a Try-Catch because Managed Cloud Databases (like Railway)
    // lock down the 'CREATE DATABASE' permission.
    try {
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${targetDbName}\`;`);
      console.log(`Database ${targetDbName} ensured.`);
    } catch (dbError) {
      console.log(`Skipping DB creation (Managed Cloud Database detected or access restricted).`);
    }
    await connection.end();

    // STEP 2: Sequelize ORM Authentication
    // ---------------------------------------------------
    const { sequelize } = require('./models');
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    
    // Sync models
    // 'alter: true' non-destructively modifies tables to match current models.
    await sequelize.sync({ alter: true });
    console.log('Database synced.');

    // STEP 3: Ignite HTTP Server
    // ---------------------------------------------------
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1); // Kill process on critical failure
  }
};

// Execute the bootstrap sequence
init();
```

### 1.3 Detailed Technical Breakdown

#### 1.3.1 Security Middleware & CORS Pipeline
The server utilizes `helmet` to automatically block clickjacking and XSS attacks by injecting strict HTTP security headers. 
However, the most mathematically complex logic in this file belongs to the **CORS (Cross-Origin Resource Sharing)** configuration block. By default, web browsers strictly block a website (e.g. `vercel.app`) from reading data off a completely different server (`railway.app`). The backend must explicitly reply with an `Access-Control-Allow-Origin` header authorizing the frontend.

We use a dynamic callback strategy to authorize incoming connections:
1. It reads the incoming request's `origin`.
2. If the request comes from an automated tool (like Postman), `origin` is null, and we allow it.
3. If the request matches `http://localhost:5173` (Local Dev) or matches the `FRONTEND_URL` environment variable, it passes.
4. **The Catch-All:** If the request originates from *any* Vercel deployment preview (detected via `origin.endsWith('.vercel.app')`), the connection is allowed. 

The `credentials: true` parameter is vital. Without this, the browser will refuse to attach or save the HTTP-Only JWT Authentication cookies, completely breaking the Login logic.

#### 1.3.2 The Bootstrapping Sequence
A standard Express app simply executes `app.listen()` at the bottom of the file. However, our application utilizes a specialized **Asynchronous Bootstrapper Pattern** via the `init()` function. 

This guarantees a strict order of operations:
1. **Raw Connection Phase:** Before the ORM (Sequelize) even attempts to run, the system uses the raw `mysql2` driver to connect directly to the MySQL server instance. It forcefully injects a `CREATE DATABASE IF NOT EXISTS` command. 
   - *Cloud Safeguard:* If deployed to Railway, the script will trigger an Access Denied error (since cloud users cannot create global databases). The `try...catch` block gracefully catches this and proceeds.
2. **ORM Mount Phase:** Once the database physical existence is confirmed, `sequelize.authenticate()` is fired to map the logical schema connections.
3. **Synchronization Phase:** `sequelize.sync({ alter: true })` analyzes the exact state of the MySQL tables. If a developer added a new column (e.g., `phone_number`), Sequelize dynamically injects an `ALTER TABLE` SQL command to restructure the remote database without dropping the users' existing data.
4. **Traffic Acceptance Phase:** Only after steps 1-3 have successfully passed without throwing an exception does `app.listen` execute. If the database fails, the server crashes intentionally via `process.exit(1)` rather than starting up and serving broken API responses.
