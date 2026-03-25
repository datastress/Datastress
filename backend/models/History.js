import { openDB } from '../db.js';

export async function addHistory(userId, bytes) {
  const db = await openDB();
  await db.run('INSERT INTO history (userId, bytes, date) VALUES (?,?,datetime("now"))', [userId, bytes]);
}

export async function getHistory(userId) {
  const db = await openDB();
  return db.all('SELECT * FROM history WHERE userId=? ORDER BY date DESC', [userId]);
}
