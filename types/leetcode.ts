export interface LeetCodeProfile {
  username: string;
  name: string;
  avatar: string;
  ranking: number;
  reputation: number;
  gitHub: string | null;
  twitter: string | null;
  linkedIN: string | null;
  country: string | null;
  company: string | null;
  school: string | null;
}

export interface LeetCodeSolved {
  solvedProblem: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalSubmissionNum: {
    difficulty: string;
    count: number;
    submissions: number;
  }[];
  acSubmissionNum: {
    difficulty: string;
    count: number;
    submissions: number;
  }[];
}

export interface LeetCodeCalendar {
  submissionCalendar: Record<string, number>;
  totalActiveDays: number;
  streak: number;
}

export interface UserData {
  profile: LeetCodeProfile;
  solved: LeetCodeSolved;
  calendar: LeetCodeCalendar;
}
