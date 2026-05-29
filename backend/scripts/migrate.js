import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../src/database/connection.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, '..', '..', 'database', 'migrations');
db.exec('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime(\'now\')))');
const applied = new Set(db.prepare('SELECT name FROM schema_migrations').all().map((row) => row.name));

for (const file of fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort()) {
  if (applied.has(file)) continue;
  const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
  const tx = db.transaction(() => {
    db.exec(sql);
    db.prepare('INSERT INTO schema_migrations (name) VALUES (?)').run(file);
  });
  tx();
  console.log(`Applied ${file}`);
}
console.log('Migrations complete');
