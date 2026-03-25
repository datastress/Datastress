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

// ===== USERS AND SESSIONS
const users = [];
const sessions = new Map();
const history = [];

// ===== AUTH
app.post("/api/register",(req,res)=>{
  const {email,password} = req.body;
  users.push({email,password,plan:"free"});
  res.json({success:true});
});

app.post("/api/login",(req,res)=>{
  const {email,password} = req.body;
  const user = users.find(u=>u.email===email && u.password===password);
  if(!user) return res.status(401).send("Invalid credentials");
  const token = uuidv4();
  sessions.set(token,user);
  res.json({token});
});

// ===== DATA STREAM
app.get("/api/chunk",(req,res)=>{
  res.set("Cache-Control","no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma","no-cache");
  res.set("Expires","0");

  const buffer = Buffer.alloc(1024*1024, Math.floor(Math.random()*256));
  res.set("Content-Type","application/octet-stream");
  res.send(buffer);

  // Save history per user if token provided
  const token = req.headers["authorization"];
  if(token && sessions.has(token)) {
    history.push({user:sessions.get(token).email, bytes:buffer.length, date:new Date()});
  }
});

// ===== SERVE FRONTEND
app.use(express.static(path.join(__dirname,"../frontend")));
app.get("*",(req,res)=>{
  res.sendFile(path.join(__dirname,"../frontend/index.html"));
});

// ===== STRIPE / PAYPAL PLACEHOLDER
app.post("/api/premium",(req,res)=>{
  // integrate Stripe / PayPal API here
  res.json({success:true, message:"Premium purchase placeholder"});
});

app.listen(3000,()=>console.log("Server running on port 3000"));
