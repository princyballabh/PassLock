const express = require("express");
const dotenv = require("dotenv").config();
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: "Too many requests from this IP, please try again later",
});

// JWT configuration
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) throw new Error("JWT_SECRET environment variable is required");

// Middleware
app.use(bodyParser.json({ limit: "10kb" }));

// Database connection setup
const url = process.env.MONGODB_URI;
if (!url) throw new Error("MONGODB_URI environment variable is required");
const client = new MongoClient(url);
const dbName = "PassLock";

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token)
    return res.status(401).json({ error: "Authorization token required" });

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = user;
    next();
  });
};

// Input validation middleware
const validateRegistration = (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }
  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters" });
  }
  next();
};

// Connect to MongoDB and define routes inside the connection block
client
  .connect()
  .then(() => {
    console.log("Connected to MongoDB Atlas");
    const db = client.db(dbName);

    // Registration route
    app.post(
      "/api/register",
      authLimiter,
      validateRegistration,
      async (req, res) => {
        try {
          const { username, password } = req.body;

          const existingUser = await db
            .collection("users")
            .findOne({ username });
          if (existingUser) {
            return res.status(409).json({ error: "Username already exists" });
          }

          const hashedPassword = await bcrypt.hash(password, 12);
          await db.collection("users").insertOne({
            username,
            password: hashedPassword,
            createdAt: new Date(),
          });

          res.status(201).json({ success: true });
        } catch (error) {
          console.error("Registration error:", error);
          res.status(500).json({ error: "Registration failed" });
        }
      }
    );

    // Login route
    app.post("/api/login", authLimiter, async (req, res) => {
      try {
        const { username, password } = req.body;
        const user = await db.collection("users").findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ username }, jwtSecret, { expiresIn: "1h" });
        res.json({
          token,
          username,
          expiresIn: 3600, // Token expiration in seconds
        });
      } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Login failed" });
      }
    });

    // Get all passwords for the authenticated user
    app.get("/api/passwords", authenticateToken, async (req, res) => {
      try {
        const passwords = await db
          .collection("passwords")
          .find({ user: req.user.username })
          .project({ _id: 0, user: 0 })
          .toArray();
        res.json(passwords);
      } catch (error) {
        console.error("Get passwords error:", error);
        res.status(500).json({ error: "Failed to fetch passwords" });
      }
    });

    // Add or update a password
    app.post("/api/passwords", authenticateToken, async (req, res) => {
      try {
        const passwordData = {
          ...req.body,
          user: req.user.username,
          createdAt: new Date(),
        };

        const { id } = passwordData;
        let result;
        if (id) {
          result = await db
            .collection("passwords")
            .updateOne(
              { id, user: req.user.username },
              { $set: passwordData },
              { upsert: true }
            );
        } else {
          result = await db.collection("passwords").insertOne(passwordData);
        }

        res.json({
          success: true,
          id: id || result.insertedId,
          action: id ? "updated" : "created",
        });
      } catch (error) {
        console.error("Save password error:", error);
        res.status(500).json({ error: "Failed to save password" });
      }
    });

    // Delete a password by id
    app.delete("/api/passwords/:id", authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        const result = await db.collection("passwords").deleteOne({
          id,
          user: req.user.username,
        });

        if (result.deletedCount === 0) {
          return res.status(404).json({ error: "Password not found" });
        }

        res.json({ success: true });
      } catch (error) {
        console.error("Delete password error:", error);
        res.status(500).json({ error: "Failed to delete password" });
      }
    });

    // Health check endpoint
    app.get("/health", (req, res) => {
      res.status(200).json({
        status: "ok",
        db: client.topology.isConnected() ? "connected" : "disconnected",
      });
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error("Unhandled error:", err);
      res.status(500).json({ error: "Internal server error" });
    });

    // Start server after DB is connected and routes are defined
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
