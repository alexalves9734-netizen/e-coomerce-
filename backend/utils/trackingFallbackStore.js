import fs from "fs";
import path from "path";

const storePath = path.join(process.cwd(), "data", "trackings.json");

function ensureStore() {
  const dir = path.dirname(storePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(storePath)) fs.writeFileSync(storePath, JSON.stringify({ trackings: [] }, null, 2));
}

export function readTrackings() {
  try {
    ensureStore();
    const raw = fs.readFileSync(storePath, "utf8");
    const data = JSON.parse(raw || "{}");
    return Array.isArray(data.trackings) ? data.trackings : [];
  } catch (err) {
    return [];
  }
}

export function writeTrackings(trackings) {
  try {
    ensureStore();
    fs.writeFileSync(storePath, JSON.stringify({ trackings }, null, 2));
    return true;
  } catch (err) {
    return false;
  }
}

export function upsertTracking(tracking) {
  const list = readTrackings();
  const idx = list.findIndex(t => t.trackingCode === tracking.trackingCode || t.orderId === tracking.orderId);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...tracking, lastUpdate: new Date() };
  } else {
    list.push({ ...tracking, lastUpdate: new Date(), eventos: tracking.eventos || [] });
  }
  writeTrackings(list);
  return tracking;
}

export function getByTrackingCode(code) {
  const list = readTrackings();
  return list.find(t => t.trackingCode === code) || null;
}

export function getByOrderId(orderId) {
  const list = readTrackings();
  return list.find(t => t.orderId === orderId) || null;
}

export function removeByTrackingCode(code) {
  const list = readTrackings();
  const next = list.filter(t => t.trackingCode !== code);
  writeTrackings(next);
  return next.length !== list.length;
}

export function listToUpdate() {
  const list = readTrackings();
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  return list.filter(t => {
    const delivered = t.status === "delivered" || t.status === "returned";
    const lastChecked = new Date(t.lastChecked || t.lastUpdate || Date.now()).getTime();
    const tooManyErrors = (t.errorCount || 0) >= 5;
    return !delivered && lastChecked < oneHourAgo && !tooManyErrors;
  });
}