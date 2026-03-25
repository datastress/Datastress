import { openDB } from '../db.js';
import bcrypt from 'bcrypt';

export async function createUser(email, password, plan='free') {
  const db = await openDB();
  const hash = await bcrypt.hash(password, 10);
  await db.run('INSERT INTO users (email,password,plan) VALUES (?,?,?)', [email, hash, plan]);
}

export async function getUserByEmail(email) {
  const db = await openDB();
  return db.get('SELECT * FROM users WHERE email=?', [email]);
}

export async function updateUserPlan(id, plan) {
  const db = await openDB();
  await db.run('UPDATE users SET plan=? WHERE id=?', [plan, id]);
}
