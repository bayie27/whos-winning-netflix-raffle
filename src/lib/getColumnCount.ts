/**
 * Determines the number of columns for the profile grid based on the participant count.
 * Breakpoints:
 * - <= 10  -> 3 columns
 * - <= 20  -> 4 columns
 * - <= 35  -> 5 columns
 * - <= 56  -> 6 columns
 * - <= 80  -> 7 columns
 * - <= 110 -> 8 columns
 * - > 110  -> 9 columns
 */
export function getColumnCount(participantCount: number): number {
  if (participantCount <= 10) return 3;
  if (participantCount <= 20) return 4;
  if (participantCount <= 35) return 5;
  if (participantCount <= 56) return 6;
  if (participantCount <= 80) return 7;
  if (participantCount <= 110) return 8;
  return 9;
}
