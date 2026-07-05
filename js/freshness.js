// Freshness: item status is derived at read time, never stored.
// Tone rule for every string in this file: encouraging, never shaming.
import { FRESH } from './config.js';

export const DAY_MS = 24 * 60 * 60 * 1000;

export function expiresAt(item) {
  if (item.shelfLifeDays == null || !Number.isFinite(item.shelfLifeDays)) return null;
  return item.addedAt + item.shelfLifeDays * DAY_MS;
}

// "stable" | "fresh" | "useSoon" | "urgent" | "expired"
export function itemStatus(item, now = Date.now()) {
  const exp = expiresAt(item);
  if (exp === null) return 'stable';
  const daysLeft = (exp - now) / DAY_MS;
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= FRESH.urgentDays) return 'urgent';
  if (daysLeft <= FRESH.useSoonDays) return 'useSoon';
  return 'fresh';
}

export function daysLeft(item, now = Date.now()) {
  const exp = expiresAt(item);
  return exp === null ? null : (exp - now) / DAY_MS;
}

// Short chip hint: "today" / "~3d" / "past best"
export function daysLeftLabel(item, now = Date.now()) {
  const d = daysLeft(item, now);
  if (d === null) return '';
  if (d < 0) return 'past best';
  if (d <= 1) return 'today';
  return `~${Math.ceil(d)}d`;
}

// Roll the whole pantry into one read: at-risk buckets + the cat's mood.
// Mood priority per spec: urgent -> worried, expired -> sad,
// useSoon -> curious, otherwise content.
export function pantryHealth(pantry, now = Date.now()) {
  const urgent = [], useSoon = [], expired = [];
  for (const item of pantry) {
    const s = itemStatus(item, now);
    if (s === 'urgent') urgent.push(item);
    else if (s === 'useSoon') useSoon.push(item);
    else if (s === 'expired') expired.push(item);
  }
  let mood = 'content';
  if (urgent.length > 0) mood = 'worried';
  else if (expired.length > 0) mood = 'sad';
  else if (useSoon.length > 0) mood = 'curious';
  return { urgent, useSoon, expired, mood };
}

// mood -> cat animation state
export const MOOD_STATE = {
  content: 'idle',
  curious: 'curious',
  worried: 'worried',
  sad: 'sad',
};
