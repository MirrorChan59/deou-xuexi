import type { AppUser, AppUserRole, AppUserStatus } from '@shared/app-user';
import type { InterviewQuestion } from '@shared/interview';
import { readPracticeState } from '../InterviewPage/practice-storage';

export type LocalUserStatus = AppUserStatus | '本地';

export interface UserProgressSummary {
  name: string;
  role: AppUserRole;
  status: LocalUserStatus;
  inBase: boolean;
  totalQuestions: number;
  mastered: number;
  mistakes: number;
  favorites: number;
  answered: number;
  masteryRate: number;
  hasLocalRecord: boolean;
}

const DEMO_ROLE_BY_NAME: Record<string, AppUserRole> = {
  演示管理员: '管理员',
  演示学生: '学生',
};

export const buildUserSummaries = (
  users: AppUser[],
  localNames: string[],
  questions: InterviewQuestion[],
): UserProgressSummary[] => {
  const baseByName = new Map<string, AppUser>();
  for (const user of users) {
    baseByName.set(user.name, user);
  }

  const allNames: string[] = [];
  for (const user of users) {
    allNames.push(user.name);
  }
  for (const name of localNames) {
    if (!baseByName.has(name)) allNames.push(name);
  }

  const totalQuestions = questions.length;

  return allNames.map((name: string) => {
    const baseUser = baseByName.get(name);
    const state = readPracticeState(name);
    let mastered = 0;
    let mistakes = 0;
    let favorites = 0;
    let answered = 0;

    for (const question of questions) {
      const record = state[question.id];
      if (!record) continue;
      if (record.mastery === 'mastered') mastered += 1;
      if (record.mastery === 'unmastered') mistakes += 1;
      if (record.favorite) favorites += 1;
      if (record.answer) answered += 1;
    }

    return {
      name,
      role: baseUser?.role ?? DEMO_ROLE_BY_NAME[name] ?? '学生',
      status: baseUser?.status ?? '本地',
      inBase: Boolean(baseUser),
      totalQuestions,
      mastered,
      mistakes,
      favorites,
      answered,
      masteryRate:
        totalQuestions > 0
          ? Math.round((mastered / totalQuestions) * 100)
          : 0,
      hasLocalRecord: Object.keys(state).length > 0,
    };
  });
};
