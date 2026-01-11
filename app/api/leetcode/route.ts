import { NextResponse } from "next/server";
import { LEETCODE_USERS } from "@/config/users";
import { UserData } from "@/types/leetcode";

const API_BASE = "https://alfa-leetcode-api.onrender.com";

async function fetchUserData(username: string): Promise<UserData | null> {
  try {
    const [profileRes, solvedRes, calendarRes] = await Promise.all([
      fetch(`${API_BASE}/${username}`),
      fetch(`${API_BASE}/${username}/solved`),
      fetch(`${API_BASE}/${username}/calendar`),
    ]);

    if (!profileRes.ok || !solvedRes.ok || !calendarRes.ok) {
      console.error(`Failed to fetch data for ${username}`);
      return null;
    }

    const [profile, solved, calendarRaw] = await Promise.all([
      profileRes.json(),
      solvedRes.json(),
      calendarRes.json(),
    ]);

    // Parse submissionCalendar if it's a string
    const calendar = {
      ...calendarRaw,
      submissionCalendar:
        typeof calendarRaw.submissionCalendar === "string"
          ? JSON.parse(calendarRaw.submissionCalendar)
          : calendarRaw.submissionCalendar || {},
    };

    return { profile, solved, calendar };
  } catch (error) {
    console.error(`Error fetching data for ${username}:`, error);
    return null;
  }
}

export async function GET() {
  const results = await Promise.all(
    LEETCODE_USERS.map(async (username) => {
      const data = await fetchUserData(username);
      return { username, data };
    })
  );

  const users = results
    .filter((r) => r.data !== null)
    .map((r) => ({ username: r.username, ...r.data }));

  return NextResponse.json({ users });
}
