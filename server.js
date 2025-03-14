import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import helmet from "helmet";
import connectDB from "./config/db.js";
import cors from "cors";
import logger from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import taskRoutes from "./routes/taskRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js"
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import env from "./environment.js";

// Load environment variables
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Connect to the database
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // Block IP after 20 requests
  message: "Too many requests from this IP, please try again later.",
});


connectDB();

const app = express();
app.use(helmet());
app.use(limiter);
// Handle CORS:
app.use(cors({
  origin: env.frontend_url,
  credentials: true
}));
// Log requests to the console in a compact format:
app.use(logger("dev"));

// Full log of all requests to /log/access.log:
app.use(
  logger("common", {
    stream: fs.createWriteStream(
      path.join(__dirname, ".", "log", "access.log"),
      { flags: "a" }
    ),
  })
);

// if (env.node_env === "production") {
//   app.set("trust proxy", 1);
// }

// Handle cookies 🍪
app.use(cookieParser());

// Use sessions:
app.use(
  session({
    secret: env.session_secret || "your_secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: env.mongo_db,
      dbName: "pi-app-todo",
      collectionName: "user_sessions",
    }),
    cookie: { 
      secure: env.node_env === "production", // Set to true if using HTTPS
      sameSite: env.node_env === "production" ? "none" : "lax",
      httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);
app.use(express.json());
// Routes
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/donations", paymentRoutes);

// Hello World page to check everything works:
app.get("/", async (_, res) => {
  res.status(200).send({ message: "Hello, World!" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "Server is running" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.use((req, res) => {
  res.status(404).send("Not found");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
