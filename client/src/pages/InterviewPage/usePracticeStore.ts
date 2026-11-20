import { useCallback, useEffect, useRef, useState } from 'react';

import {
  readPracticeState,
  writePracticeState,
  type MasteryStatus,
  type PracticeRecord,
  type PracticeState,
} from './practice-storage';

export type { MasteryStatus, PracticeRecord, PracticeState };

const isEmptyRecord = (record: PracticeRecord): boolean =>
  !record.mastery && !record.favorite && !record.answer;

export const usePracticeStore = (userName: string) => {
  const [state, setState] = useState<PracticeState>(() =>
    readPracticeState(userName),
  );
  const activeUserRef = useRef<string>(userName);

  useEffect(() => {
    if (activeUserRef.current === userName) return;
    activeUserRef.current = userName;
    setState(readPracticeState(userName));
  }, [userName]);

  useEffect(() => {
    if (!userName || activeUserRef.current !== userName) return;
    writePracticeState(userName, state);
  }, [state, userName]);

  const setMastery = useCallback(
    (id: string, mastery: MasteryStatus | null) => {
      setState((prev: PracticeState) => {
        const next: PracticeState = { ...prev };
        const record: PracticeRecord = { ...(prev[id] ?? {}) };
        if (mastery === null) {
          delete record.mastery;
        } else {
          record.mastery = mastery;
        }
        if (isEmptyRecord(record)) {
          delete next[id];
        } else {
          next[id] = record;
        }
        return next;
      });
    },
    [],
  );

  const toggleFavorite = useCallback((id: string) => {
    setState((prev: PracticeState) => {
      const next: PracticeState = { ...prev };
      const record: PracticeRecord = { ...(prev[id] ?? {}) };
      if (record.favorite) {
        delete record.favorite;
      } else {
        record.favorite = true;
      }
      if (isEmptyRecord(record)) {
        delete next[id];
      } else {
        next[id] = record;
      }
      return next;
    });
  }, []);

  const setAnswer = useCallback((id: string, answer: string) => {
    setState((prev: PracticeState) => {
      const next: PracticeState = { ...prev };
      const record: PracticeRecord = { ...(prev[id] ?? {}) };
      if (answer.trim().length === 0) {
        delete record.answer;
      } else {
        record.answer = answer;
      }
      if (isEmptyRecord(record)) {
        delete next[id];
      } else {
        next[id] = record;
      }
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    setState({});
  }, []);

  return { state, setMastery, toggleFavorite, setAnswer, resetAll };
};
