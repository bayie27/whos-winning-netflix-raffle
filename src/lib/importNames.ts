type JsonRecord = Record<string, unknown>;

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function extractName(value: unknown): string | null {
  if (typeof value === 'string') {
    const name = value.trim();
    return name.length > 0 ? name : null;
  }

  if (isJsonRecord(value) && typeof value.name === 'string') {
    const name = value.name.trim();
    return name.length > 0 ? name : null;
  }

  return null;
}

export function parseImportedNames(rawJson: string): string[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawJson);
  } catch {
    throw new Error('The selected file is not valid JSON.');
  }

  let entries: unknown[] | null = null;

  if (Array.isArray(parsed)) {
    entries = parsed;
  } else if (isJsonRecord(parsed)) {
    if (Array.isArray(parsed.names)) {
      entries = parsed.names;
    } else if (Array.isArray(parsed.students)) {
      entries = parsed.students;
    }
  }

  if (!entries) {
    throw new Error('The JSON must contain a names or students array.');
  }

  const names = entries
    .map(extractName)
    .filter((name): name is string => name !== null);

  if (names.length === 0) {
    throw new Error('The JSON does not contain any usable student names.');
  }

  return names;
}
