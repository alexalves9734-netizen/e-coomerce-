import fs from 'fs';
import path from 'path';

const storePath = path.join(process.cwd(), 'data', 'freight_regions.json');

function ensureDir() {
  const dir = path.dirname(storePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function readRegions() {
  try {
    ensureDir();
    if (!fs.existsSync(storePath)) {
      return [];
    }
    const raw = fs.readFileSync(storePath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function writeRegions(regions) {
  ensureDir();
  fs.writeFileSync(storePath, JSON.stringify(regions, null, 2), 'utf-8');
}

export function generateId() {
  // Simple unique id
  return `fb_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
}