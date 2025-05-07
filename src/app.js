const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const dotenv = require("dotenv");
const cors = require("cors");
const { Server } = require("socket.io");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const groupRoutes = require("./routes/group");
const authMiddleware = require("./middlewares/admin");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const YAML = require("yamljs");
const rateLimit = require("express-rate-limit");
const { initSocket } = require("./sockets/socket");
const { seedAdmin } = require("../seed/adminSeeder");
const { logger } = require("./utils/logger");
const path = require("path");

// Load .env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

initSocket(io);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    logger.info("MongoDB connected");
    seedAdmin();
  })
  .catch((err) => logger.error("DB connection error: " + err));

// Middleware
app.use(cors());
app.use(express.json());
app.set("trust proxy", 1);

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests. Please try again later.",
});
app.use(limiter);

// Routes
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", groupRoutes);
app.use("/api", groupRoutes);

app.get("/", (req, res) => {
  res.send({ msg: "welcome to chat app" });
});

// Swagger YAML (OpenAPI) files
const userDoc = YAML.load(path.join(__dirname, "../swagger/user.yaml"));
const adminDoc = YAML.load(path.join(__dirname, "../swagger/admin.yaml"));

// Swagger UI (YAML-based docs)
app.use(
  "/api-docs/user",
  swaggerUi.serveFiles(userDoc),
  swaggerUi.setup(userDoc)
);
app.use(
  "/api-docs/admin",
  swaggerUi.serveFiles(adminDoc),
  swaggerUi.setup(adminDoc)
);

// Swagger from JS doc (optional)
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Chat App API",
      version: "1.0.0",
      description: "API documentation for Chat Application",
    },
    servers: [{ url: "http://localhost:5000/api" }],
  },
  apis: [path.join(__dirname, "./routes/*.js")], // fix path here!
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
