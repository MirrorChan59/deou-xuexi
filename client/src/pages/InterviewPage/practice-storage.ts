export type MasteryStatus = 'mastered' | 'unmastered';

export interface PracticeRecord {
  mastery?: MasteryStatus;
  favorite?: boolean;
  answer?: string;
}

export type PracticeState = Record<string, PracticeRecord>;

const STORAGE_PREFIX = 'deou-interview-progress-v1';
const USER_KEY_SEPARATOR = '::';
const LEGACY_FAVORITES_KEY = 'deou-interview-favorites-v1';

const isMasteryStatus = (value: unknown): value is MasteryStatus =>
  value === 'mastered' || value === 'unmastered';

export const practiceStorageKey = (userName: string): string =>
  `${STORAGE_PREFIX}${USER_KEY_SEPARATOR}${encodeURIComponent(userName)}`;

const parseState = (raw: string | null): PracticeState => {
  if (!raw) return {};

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }

  if (typeof parsed !== 'object' || parsed === null) return {};

  const result: PracticeState = {};
  for (const [id, value] of Object.entries(
    parsed as Record<string, unknown>,
  )) {
    if (typeof value !== 'object' || value === null) continue;
    const rawRecord = value as Record<string, unknown>;
    const record: PracticeRecord = {};
    if (isMasteryStatus(rawRecord.mastery)) record.mastery = rawRecord.mastery;
    if (rawRecord.favorite === true) record.favorite = true;
    if (typeof rawRecord.answer === 'string' && rawRecord.answer.length > 0) {
      record.answer = rawRecord.answer;
    }
    if (record.mastery || record.favorite || record.answer) {
      result[id] = record;
    }
  }

  return result;
};

const readLegacyFavorites = (): string[] => {
  try {
    const raw = window.localStorage.getItem(LEGACY_FAVORITES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id: unknown): id is string => typeof id === 'string');
  } catch {
    return [];
  }
};

const migrateLegacyState = (userName: string): PracticeState => {
  const legacyRaw = window.localStorage.getItem(STORAGE_PREFIX);
  const favorites = readLegacyFavorites();
  if (!legacyRaw && favorites.length === 0) return {};

  const migrated: PracticeState = parseState(legacyRaw);
  for (const id of favorites) {
    migrated[id] = { ...migrated[id], favorite: true };
  }

  if (Object.keys(migrated).length > 0) {
    window.localStorage.setItem(
      practiceStorageKey(userName),
      JSON.stringify(migrated),
    );
  }
  window.localStorage.removeItem(STORAGE_PREFIX);
  window.localStorage.removeItem(LEGACY_FAVORITES_KEY);
  return migrated;
};

export const readPracticeState = (userName: string): PracticeState => {
  if (typeof window === 'undefined' || !userName) return {};

  const key = practiceStorageKey(userName);
  try {
    const raw = window.localStorage.getItem(key);
    if (raw !== null) return parseState(raw);
    return migrateLegacyState(userName);
  } catch {
    return {};
  }
};

export const writePracticeState = (
  userName: string,
  state: PracticeState,
): void => {
  if (typeof window === 'undefined' || !userName) return;
  try {
    window.localStorage.setItem(
      practiceStorageKey(userName),
      JSON.stringify(state),
    );
  } catch {
    // 存储不可用时练习进度仅在当前会话生效
  }
};

export const listLocalPracticeUsers = (): string[] => {
  if (typeof window === 'undefined') return [];
  const prefix = `${STORAGE_PREFIX}${USER_KEY_SEPARATOR}`;
  const names: string[] = [];
  try {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (!key || !key.startsWith(prefix)) continue;
      const rawName = key.slice(prefix.length);
      try {
        names.push(decodeURIComponent(rawName));
      } catch {
        names.push(rawName);
      }
    }
  } catch {
    return [];
  }
  return names;
};
