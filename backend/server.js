import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

import { createUser, getUserByEmail, updateUserPlan } from './models/User.js';
import { addHistory, getHistory } from './models/History.js';
import { openDB } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Create tables if not exist
(async ()=>{
  const db = await openDB();
  await db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    plan TEXT DEFAULT 'free'
  )`);
  await db.run(`CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    bytes INTEGER,
    date TEXT
  )`);
})();

// =================== AUTH ===================
app.post("/api/register", async (req,res)=>{
  const {email,password} = req.body;
  try {
    await createUser(email,password);
    res.json({success:true});
  } catch(e) {
    res.status(400).json({error:"User exists"});
  }
});

app.post("/api/login", async (req,res)=>{
  const {email,password} = req.body;
  const user = await getUserByEmail(email);
  if(!user) return res.status(401).json({error:"Invalid credentials"});
  const match = await bcrypt.compare(password,user.password);
  if(!match) return res.status(401).json({error:"Invalid credentials"});
  const token = jwt.sign({userId:user.id},JWT_SECRET,{expiresIn:"7d"});
  res.json({token,user:{email:user.email,plan:user.plan}});
});

// Middleware for auth
const auth = (req,res,next)=>{
  const token = req.headers['authorization'];
  if(!token) return res.status(401).json({error:"No token"});
  try {
    const decoded = jwt.verify(token,JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch(e) {
    res.status(401).json({error:"Invalid token"});
  }
};

// =================== DATA CHUNK ===================
app.get("/api/chunk", auth, async (req,res)=>{
  res.set("Cache-Control","no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma","no-cache");
  res.set("Expires","0");

  const buffer = Buffer.alloc(1024*1024, Math.floor(Math.random()*256)); // 1MB random
  res.set("Content-Type","application/octet-stream");
  res.send(buffer);

  await addHistory(req.userId, buffer.length);
});

// =================== HISTORY ===================
app.get("/api/history", auth, async (req,res)=>{
  const hist = await getHistory(req.userId);
  res.json(hist);
});

// =================== PAYMENTS ===================
app.post("/api/premium/stripe",(req,res)=>{
  res.json({success:true,url:"Stripe Checkout URL here"});
});

app.post("/api/premium/paypal",(req,res)=>{
  res.json({success:true,url:"PayPal Checkout URL here"});
});

app.post("/api/premium/mbway",(req,res)=>{
  res.json({success:true,url:"MBWay payment URL here"});
});

// =================== SERVE FRONTEND ===================
app.use(express.static(path.join(__dirname,"../frontend")));
app.get("*",(req,res)=>{
  res.sendFile(path.join(__dirname,"../frontend/index.html"));
});

app.listen(3000,()=>console.log("Server running on port 3000"));
