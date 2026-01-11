"use client";

import { useEffect, useState } from "react";
import { UserData } from "@/types/leetcode";

interface User extends UserData {
  username: string;
}

const getLeetCodeUrl = (username: string) => `https://leetcode.com/u/${username}`;

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHeatmap, setSelectedHeatmap] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/leetcode")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container">
        <div className="header">
          <h1>LeetCode Dashboard</h1>
          <p>Track and compare progress</p>
        </div>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading LeetCode stats...</p>
        </div>
      </div>
    );
  }

  // Sort users by total solved for leaderboard
  const sortedUsers = [...users].sort(
    (a, b) => b.solved.solvedProblem - a.solved.solvedProblem
  );

  const getRankIcon = (index: number) => {
    if (index === 0) return { icon: "🥇", class: "gold" };
    if (index === 1) return { icon: "🥈", class: "silver" };
    if (index === 2) return { icon: "🥉", class: "bronze" };
    return { icon: `${index + 1}`, class: "" };
  };

  const toggleHeatmap = (username: string) => {
    setSelectedHeatmap(selectedHeatmap === username ? null : username);
  };

  const selectedUser = users.find((u) => u.username === selectedHeatmap);

  return (
    <div className="container">
      <div className="header">
        <h1>LeetCode Dashboard</h1>
        <p>Track and compare progress</p>
      </div>

      {/* Leaderboard */}
      <div className="leaderboard">
        <h2>🏆 Leaderboard</h2>
        {sortedUsers.map((user, index) => {
          const rank = getRankIcon(index);
          return (
            <a
              key={user.username}
              href={getLeetCodeUrl(user.username)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
            >
              <div className="leaderboard-item">
                <div className={`leaderboard-rank ${rank.class}`}>{rank.icon}</div>
                <div className="leaderboard-user">
                  <img src={user.profile.avatar} alt={user.username} />
                  <div>
                    <strong>{user.profile.name || user.username}</strong>
                    <div style={{ fontSize: "0.8rem", color: "#888" }}>
                      @{user.username}
                    </div>
                  </div>
                </div>
                <div className="leaderboard-stats">
                  <div className="count">{user.solved.solvedProblem}</div>
                  <div className="label">problems</div>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* Heatmap Section */}
      <div className="heatmap-section">
        <h2>📅 Activity Heatmap</h2>
        <div className="heatmap-toggle-buttons">
          {users.map((user) => (
            <button
              key={user.username}
              className={`heatmap-toggle ${selectedHeatmap === user.username ? "active" : ""}`}
              onClick={() => toggleHeatmap(user.username)}
            >
              <img src={user.profile.avatar} alt={user.username} />
              <span>{user.profile.name || user.username}</span>
            </button>
          ))}
        </div>
        {selectedUser && (
          <div className="heatmap-container">
            <Heatmap calendar={selectedUser.calendar.submissionCalendar} />
          </div>
        )}
        {!selectedUser && (
          <p className="heatmap-hint">Select a user above to view their activity heatmap</p>
        )}
      </div>

      {/* Comparison Table */}
      <div className="comparison-section">
        <h2>📊 Comparison</h2>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Total</th>
              <th>Easy</th>
              <th>Medium</th>
              <th>Hard</th>
              <th>Ranking</th>
              <th>Active Days</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const maxTotal = Math.max(...users.map((u) => u.solved.solvedProblem));
              const maxEasy = Math.max(...users.map((u) => u.solved.easySolved));
              const maxMedium = Math.max(...users.map((u) => u.solved.mediumSolved));
              const maxHard = Math.max(...users.map((u) => u.solved.hardSolved));
              const bestRank = Math.min(...users.map((u) => u.profile.ranking));
              const maxActive = Math.max(...users.map((u) => u.calendar.totalActiveDays));

              return (
                <tr key={user.username}>
                  <td>
                    <a
                      href={getLeetCodeUrl(user.username)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      <div className="user-cell">
                        <img src={user.profile.avatar} alt={user.username} />
                        <span>{user.profile.name || user.username}</span>
                      </div>
                    </a>
                  </td>
                  <td className={user.solved.solvedProblem === maxTotal ? "winner total" : "total"}>
                    {user.solved.solvedProblem}
                  </td>
                  <td className={user.solved.easySolved === maxEasy ? "winner easy" : "easy"}>
                    {user.solved.easySolved}
                  </td>
                  <td className={user.solved.mediumSolved === maxMedium ? "winner medium" : "medium"}>
                    {user.solved.mediumSolved}
                  </td>
                  <td className={user.solved.hardSolved === maxHard ? "winner hard" : "hard"}>
                    {user.solved.hardSolved}
                  </td>
                  <td className={user.profile.ranking === bestRank ? "winner" : ""}>
                    #{user.profile.ranking.toLocaleString()}
                  </td>
                  <td className={user.calendar.totalActiveDays === maxActive ? "winner" : ""}>
                    {user.calendar.totalActiveDays} days
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* User Cards */}
      <div className="users-grid">
        {users.map((user) => (
          <UserCard key={user.username} user={user} />
        ))}
      </div>

      <footer>
        <p>
          Data from{" "}
          <a href="https://leetcode.com" target="_blank" rel="noopener noreferrer">
            LeetCode
          </a>{" "}
          via{" "}
          <a
            href="https://github.com/alfaarghya/alfa-leetcode-api"
            target="_blank"
            rel="noopener noreferrer"
          >
            alfa-leetcode-api
          </a>
        </p>
      </footer>
    </div>
  );
}

function Heatmap({ calendar }: { calendar: Record<string, number> }) {
  // Generate last 365 days using UTC to match LeetCode's timestamps
  const today = new Date();
  const days: { date: Date; count: number }[] = [];

  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    // Create UTC midnight timestamp to match LeetCode's format
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const timestamp = Math.floor(utcDate.getTime() / 1000);
    const count = calendar[timestamp.toString()] || 0;
    days.push({ date: utcDate, count });
  }

  // Find max for intensity scaling
  const maxCount = Math.max(...days.map((d) => d.count), 1);

  // Group by weeks (columns)
  const weeks: { date: Date; count: number }[][] = [];
  let currentWeek: { date: Date; count: number }[] = [];

  // Pad the first week with empty days
  const firstDayOfWeek = days[0].date.getDay();
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push({ date: new Date(0), count: -1 }); // -1 indicates empty
  }

  days.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const getIntensity = (count: number): number => {
    if (count <= 0) return 0;
    if (count === 1) return 1;
    if (count <= 3) return 2;
    if (count <= 6) return 3;
    return 4;
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get month labels for the weeks
  const monthLabels: { month: string; weekIndex: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, weekIndex) => {
    const validDay = week.find((d) => d.count >= 0);
    if (validDay) {
      const month = validDay.date.getMonth();
      if (month !== lastMonth) {
        monthLabels.push({ month: months[month], weekIndex });
        lastMonth = month;
      }
    }
  });

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="heatmap">
      <div className="heatmap-months">
        <div className="heatmap-day-labels-spacer"></div>
        {monthLabels.map((label, i) => (
          <div
            key={i}
            className="heatmap-month"
            style={{ gridColumnStart: label.weekIndex + 2 }}
          >
            {label.month}
          </div>
        ))}
      </div>
      <div className="heatmap-grid-wrapper">
        <div className="heatmap-day-labels">
          {dayLabels.map((day, i) => (
            <div key={day} className="heatmap-day-label">
              {i % 2 === 1 ? day : ""}
            </div>
          ))}
        </div>
        <div className="heatmap-grid">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="heatmap-week">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`heatmap-day ${day.count < 0 ? "empty" : "has-tooltip"}`}
                  data-intensity={day.count < 0 ? 0 : getIntensity(day.count)}
                  data-tooltip={day.count >= 0 ? `${day.count} submission${day.count !== 1 ? "s" : ""} on ${formatDate(day.date)}` : undefined}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="heatmap-legend">
        <span>Less</span>
        <div className="heatmap-day" data-intensity="0" />
        <div className="heatmap-day" data-intensity="1" />
        <div className="heatmap-day" data-intensity="2" />
        <div className="heatmap-day" data-intensity="3" />
        <div className="heatmap-day" data-intensity="4" />
        <span>More</span>
      </div>
    </div>
  );
}

function UserCard({ user }: { user: User }) {
  const totalProblems = { easy: 830, medium: 1750, hard: 750 };

  return (
    <div className="user-card">
      <a
        href={getLeetCodeUrl(user.username)}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none" }}
      >
        <div className="user-card-header">
          <img src={user.profile.avatar} alt={user.username} />
          <div>
            <h3>
              <a
                href={getLeetCodeUrl(user.username)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {user.profile.name || user.username}
              </a>
            </h3>
            <p>
              <a
                href={getLeetCodeUrl(user.username)}
                target="_blank"
                rel="noopener noreferrer"
              >
                @{user.username}
              </a>{" "}
              • Rank #{user.profile.ranking.toLocaleString()}
            </p>
          </div>
        </div>
      </a>

      <div className="stats-row">
        <div className="stat-box">
          <div className="number total">{user.solved.solvedProblem}</div>
          <div className="label">Total</div>
        </div>
        <div className="stat-box">
          <div className="number easy">{user.solved.easySolved}</div>
          <div className="label">Easy</div>
        </div>
        <div className="stat-box">
          <div className="number medium">{user.solved.mediumSolved}</div>
          <div className="label">Medium</div>
        </div>
        <div className="stat-box">
          <div className="number hard">{user.solved.hardSolved}</div>
          <div className="label">Hard</div>
        </div>
      </div>

      <div className="progress-bars">
        <div className="progress-item">
          <div className="progress-label">
            <span className="easy">Easy</span>
            <span>
              {user.solved.easySolved} / {totalProblems.easy}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill easy"
              style={{
                width: `${(user.solved.easySolved / totalProblems.easy) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="progress-item">
          <div className="progress-label">
            <span className="medium">Medium</span>
            <span>
              {user.solved.mediumSolved} / {totalProblems.medium}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill medium"
              style={{
                width: `${(user.solved.mediumSolved / totalProblems.medium) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="progress-item">
          <div className="progress-label">
            <span className="hard">Hard</span>
            <span>
              {user.solved.hardSolved} / {totalProblems.hard}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill hard"
              style={{
                width: `${(user.solved.hardSolved / totalProblems.hard) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="activity-info">
        <div className="activity-badge">
          <span>🔥</span> Streak: {user.calendar.streak}
        </div>
        <div className="activity-badge">
          <span>📅</span> Active: {user.calendar.totalActiveDays} days
        </div>
      </div>
    </div>
  );
}
