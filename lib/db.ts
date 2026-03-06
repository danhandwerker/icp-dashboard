import Database from "better-sqlite3";
import path from "path";
import { SavedScore, ScoreResult, Grade, ChurnRisk } from "./types";

const DB_PATH = path.join(process.cwd(), "data", "scores.db");

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    const fs = require("fs");
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.exec(`
      CREATE TABLE IF NOT EXISTS saved_scores (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_email TEXT NOT NULL,
        brand TEXT NOT NULL,
        total_score INTEGER NOT NULL,
        grade TEXT NOT NULL,
        churn_risk TEXT NOT NULL,
        predicted_spend_mid REAL NOT NULL,
        result_json TEXT NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_scores_user ON saved_scores(user_id);
      CREATE INDEX IF NOT EXISTS idx_scores_brand ON saved_scores(brand);
      CREATE INDEX IF NOT EXISTS idx_scores_created ON saved_scores(created_at);
    `);
  }
  return db;
}

export function saveScore(score: SavedScore): void {
  const db = getDb();
  db.prepare(
    `INSERT OR REPLACE INTO saved_scores (id, user_id, user_email, brand, total_score, grade, churn_risk, predicted_spend_mid, result_json, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    score.id,
    score.userId,
    score.userEmail,
    score.brand,
    score.totalScore,
    score.grade,
    score.churnRisk,
    score.predictedSpendMid,
    JSON.stringify(score.result),
    score.notes || null,
    score.createdAt
  );
}

export function getScoresByUser(userId: string): SavedScore[] {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT * FROM saved_scores WHERE user_id = ? ORDER BY created_at DESC"
    )
    .all(userId) as Array<Record<string, unknown>>;
  return rows.map(rowToSavedScore);
}

export function getAllScores(): SavedScore[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM saved_scores ORDER BY created_at DESC")
    .all() as Array<Record<string, unknown>>;
  return rows.map(rowToSavedScore);
}

export function getScoreById(id: string): SavedScore | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM saved_scores WHERE id = ?")
    .get(id) as Record<string, unknown> | undefined;
  return row ? rowToSavedScore(row) : null;
}

export function deleteScore(id: string, userId: string): boolean {
  const db = getDb();
  const result = db
    .prepare("DELETE FROM saved_scores WHERE id = ? AND user_id = ?")
    .run(id, userId);
  return result.changes > 0;
}

function rowToSavedScore(row: Record<string, unknown>): SavedScore {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    userEmail: row.user_email as string,
    brand: row.brand as string,
    totalScore: row.total_score as number,
    grade: row.grade as Grade,
    churnRisk: row.churn_risk as ChurnRisk,
    predictedSpendMid: row.predicted_spend_mid as number,
    result: JSON.parse(row.result_json as string) as ScoreResult,
    createdAt: row.created_at as string,
    notes: (row.notes as string) || undefined,
  };
}
