import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== USERS (temporary)
const users = [];
const sessions = new Map();

// ===== AUTH
app.post("/api/register", (req, res) => {
  const { email, password } = req.body;
  users.push({ email, password, plan: "free" });
  res.json({ success: true });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) return res.status(401).send("Invalid credentials");

  const token = uuidv4();
  sessions.set(token, user);

  res.json({ token });
});

// ===== DATA STREAM
app.get("/api/chunk", (req, res) => {
  const buffer = Buffer.alloc(1024 * 1024, 0);
  res.set("Content-Type", "application/octet-stream");
  res.send(buffer);
});

// ===== SERVE FRONTEND
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.listen(3000, () => console.log("Server running"));
