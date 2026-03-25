import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(cors());
app.use(express.json());

// In-memory DB (temporary)
const users = [];
const sessions = new Map();

// REGISTER
app.post("/api/register", (req, res) => {
  const { email, password } = req.body;

  users.push({ email, password, plan: "free" });

  res.json({ success: true });
});

// LOGIN
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) return res.status(401).send("Invalid credentials");

  const token = uuidv4();
  sessions.set(token, user);

  res.json({ token });
});

// GET USER
app.get("/api/me", (req, res) => {
  const token = req.headers.authorization;
  const user = sessions.get(token);

  if (!user) return res.status(403).send("Unauthorized");

  res.json(user);
});

// DATA STREAM
app.get("/api/chunk", (req, res) => {
  const size = 1024 * 1024;
  const buffer = Buffer.alloc(size, 0);

  res.set("Content-Type", "application/octet-stream");
  res.send(buffer);
});

app.listen(3000, () => console.log("Server running"));
