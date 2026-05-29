import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/connection.js';

export const MOVEMENT_TYPES = ['entra', 'sale', 'parcial', 'ingreso', 'vacio', 'maco'];

function getActivePeriod() {
  let period = db.prepare('SELECT * FROM periods WHERE ended_at IS NULL ORDER BY id DESC LIMIT 1').get();
  if (!period) {
    const result = db.prepare('INSERT INTO periods (name, created_by) VALUES (?, ?)').run('Período inicial', 'system');
    period = db.prepare('SELECT * FROM periods WHERE id = ?').get(result.lastInsertRowid);
  }
  return period;
}

function computeDeltas(type, amount = 0, envelopes = 0) {
  const nAmount = Number(amount || 0);
  const nEnvelopes = Number(envelopes || 0);
  const base = { envelopes: 0, cash_delta: 0, missing_delta: 0, total_delta: 0 };
  if (type === 'entra') return { envelopes: nEnvelopes, cash_delta: nAmount, missing_delta: 0, total_delta: nAmount };
  if (type === 'sale' || type === 'parcial') return { ...base, cash_delta: -nAmount, missing_delta: nAmount, total_delta: 0 };
  if (type === 'ingreso') return { ...base, cash_delta: nAmount, missing_delta: -nAmount, total_delta: 0 };
  if (type === 'vacio') return { ...base, envelopes: nEnvelopes };
  return base;
}

export function createMovement(input) {
  const tx = db.transaction((payload) => {
    const type = payload.type;
    const responsible = payload.responsible || 'Sistema';
    const period = getActivePeriod();

    if (type === 'maco') {
      const closedAt = payload.created_at || new Date().toISOString();
      db.prepare('UPDATE periods SET ended_at = ?, end_movement_id = (SELECT MAX(id) FROM movements) WHERE id = ?').run(closedAt, period.id);
      const movement = insertMovement({ ...payload, type, responsible, period_id: period.id, ...computeDeltas(type) });
      const nextName = payload.name || `Período ${period.id + 1}`;
      db.prepare('INSERT INTO periods (name, started_at, start_movement_id, created_by) VALUES (?, ?, ?, ?)').run(nextName, closedAt, movement.id, responsible);
      return movement;
    }

    return insertMovement({ ...payload, type, responsible, period_id: period.id, ...computeDeltas(type, payload.amount, payload.envelopes) });
  });
  return tx(input);
}

function insertMovement(payload) {
  const stmt = db.prepare(`INSERT INTO movements
    (uuid, type, responsible, envelopes, amount, cash_delta, missing_delta, total_delta, note, source, period_id, created_at)
    VALUES (@uuid, @type, @responsible, @envelopes, @amount, @cash_delta, @missing_delta, @total_delta, @note, @source, @period_id, @created_at)`);
  const data = {
    uuid: payload.uuid || uuidv4(),
    type: payload.type,
    responsible: payload.responsible,
    envelopes: Number(payload.envelopes || 0),
    amount: Number(payload.amount || 0),
    cash_delta: Number(payload.cash_delta || 0),
    missing_delta: Number(payload.missing_delta || 0),
    total_delta: Number(payload.total_delta || 0),
    note: payload.note || null,
    source: payload.source || 'web',
    period_id: payload.period_id,
    created_at: payload.created_at || new Date().toISOString()
  };
  const result = stmt.run(data);
  return db.prepare('SELECT * FROM movements WHERE id = ?').get(result.lastInsertRowid);
}

export function getSummary() {
  const row = db.prepare(`SELECT
    COALESCE(SUM(envelopes), 0) AS envelopes,
    COALESCE(SUM(cash_delta), 0) AS cash,
    COALESCE(SUM(missing_delta), 0) AS missing,
    COALESCE(SUM(total_delta), 0) AS total
    FROM movements`).get();
  return {
    envelopes: row.envelopes,
    cash: Number(row.cash.toFixed(2)),
    missing: Number(row.missing.toFixed(2)),
    total: Number((row.cash + row.missing).toFixed(2))
  };
}

export function listMovements({ page = 1, limit = 20, type, responsible, search, from, to } = {}) {
  const clauses = [];
  const params = {};
  if (type) { clauses.push('type = @type'); params.type = type; }
  if (responsible) { clauses.push('responsible = @responsible'); params.responsible = responsible; }
  if (from) { clauses.push('date(created_at) >= date(@from)'); params.from = from; }
  if (to) { clauses.push('date(created_at) <= date(@to)'); params.to = to; }
  if (search) { clauses.push('(responsible LIKE @search OR note LIKE @search OR type LIKE @search)'); params.search = `%${search}%`; }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const offset = (Number(page) - 1) * Number(limit);
  const total = db.prepare(`SELECT COUNT(*) AS count FROM movements ${where}`).get(params).count;
  const rows = db.prepare(`SELECT * FROM movements ${where} ORDER BY datetime(created_at) DESC, id DESC LIMIT @limit OFFSET @offset`).all({ ...params, limit: Number(limit), offset });
  return { rows, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) || 1 } };
}

export function getDashboardStats() {
  const today = db.prepare(`SELECT COUNT(*) movements, COALESCE(SUM(cash_delta),0) cash, COALESCE(SUM(missing_delta),0) missing FROM movements WHERE date(created_at)=date('now')`).get();
  const week = db.prepare(`SELECT COUNT(*) movements, COALESCE(SUM(cash_delta),0) cash, COALESCE(SUM(missing_delta),0) missing FROM movements WHERE date(created_at)>=date('now','-6 days')`).get();
  const month = db.prepare(`SELECT COUNT(*) movements, COALESCE(SUM(cash_delta),0) cash, COALESCE(SUM(missing_delta),0) missing FROM movements WHERE strftime('%Y-%m', created_at)=strftime('%Y-%m','now')`).get();
  const daily = db.prepare(`SELECT date(created_at) date, COALESCE(SUM(cash_delta),0) cash, COALESCE(SUM(missing_delta),0) missing, COALESCE(SUM(total_delta),0) total, COUNT(*) movements FROM movements WHERE date(created_at)>=date('now','-29 days') GROUP BY date(created_at) ORDER BY date`).all();
  const byUser = db.prepare(`SELECT responsible, COUNT(*) movements, COALESCE(SUM(amount),0) amount FROM movements GROUP BY responsible ORDER BY amount DESC LIMIT 10`).all();
  const byType = db.prepare(`SELECT type, COUNT(*) value FROM movements GROUP BY type ORDER BY value DESC`).all();
  return { summary: getSummary(), today, week, month, daily, byUser, byType, latest: listMovements({ limit: 8 }).rows };
}

export function listPeriods() {
  return db.prepare(`SELECT p.*,
    COUNT(m.id) movements,
    COALESCE(SUM(m.envelopes),0) envelopes,
    COALESCE(SUM(m.cash_delta),0) cash,
    COALESCE(SUM(m.missing_delta),0) missing,
    COALESCE(SUM(m.cash_delta + m.missing_delta),0) total
    FROM periods p LEFT JOIN movements m ON m.period_id = p.id
    GROUP BY p.id ORDER BY p.id DESC`).all();
}

export function getPeriodMovements(periodId) {
  return db.prepare('SELECT * FROM movements WHERE period_id = ? ORDER BY datetime(created_at) DESC, id DESC').all(periodId);
}
