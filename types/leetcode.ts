export interface Profile {
  username: string;
  name: string;
  avatar: string;
  ranking: number;
  reputation: number;
  gitHub?: string;
  twitter?: string;
  linkedIN?: string;
  website?: string[];
}

export interface Solved {
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

export interface Calendar {
  streak: number;
  totalActiveDays: number;
  dccBadges?: {
    timestamp: number;
    badge: {
      name: string;
      icon: string;
    };
  }[];
  submissionCalendar: {
    [timestamp: string]: number;
  };
}

export interface UserData {
  profile: Profile;
  solved: Solved;
  calendar: Calendar;
}

export interface User extends UserData {
  username: string;
}
