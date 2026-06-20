import type { Participant } from '../types';
import { AVATAR_URLS } from './avatars';

const AVATAR_COLORS = [
  '#e50914', // Netflix Red
  '#1f8fef', // Light Blue
  '#46d369', // Bright Green
  '#f8970f', // Orange
  '#923cb5', // Purple
  '#b9090b', // Dark Red
];

/**
 * A simple hash function to map a string to a stable positive integer.
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

/**
 * Parses raw newline-separated text into a list of Participant objects.
 * Strips leading/trailing whitespace, ignores blank lines, and enforces
 * a minimum of 2 names. Assigns stable IDs, round-robin colors, and
 * shuffled Netflix CDN avatar URLs.
 */
export function parseNames(rawText: string): Participant[] {
  if (!rawText) return [];

  const names = rawText
    .split('\n')
    .map((line) => line.trim())
    .filter((name) => name.length > 0);

  // Enforce a minimum of 2 valid names
  if (names.length < 2) {
    return [];
  }

  return names.map((name, index) => {
    // Assign stable id (UUID)
    const id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `participant-${index}-${Math.random().toString(36).substring(2, 9)}`;

    // Assign color from the fixed 6-color palette (round-robin)
    const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

    // Seeded stable avatar selection (shuffled relative to name list order)
    const avatarIndex = hashCode(name) % (AVATAR_URLS.length || 1);
    const avatarUrl = AVATAR_URLS.length > 0 ? AVATAR_URLS[avatarIndex] : '';

    return {
      id,
      name,
      avatarUrl,
      avatarColor,
    };
  });
}
