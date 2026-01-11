"use client";

import { useEffect, useState } from "react";
import { User } from "@/types/leetcode";

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          Loading LeetCode data...
        </div>
      </div>
    );
  }

  const sortedByTotal = [...users].sort(
    (a, b) => b.solved.solvedProblem - a.solved.solvedProblem
  );

  const findWinner = (key: keyof typeof users[0]["solved"]) => {
    const max = Math.max(...users.map((u) => Number(u.solved[key])));
    return users.find((u) => u.solved[key] === max)?.username;
  };

  const renderHeatmap = (user: User) => {
    const calendar = user.calendar.submissionCalendar;
    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    // Generate all weeks for the past year
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    let currentDate = new Date(oneYearAgo);

    // Start from the first Sunday
    while (currentDate.getDay() !== 0) {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    while (currentDate <= now) {
      currentWeek.push(new Date(currentDate));
      if (currentDate.getDay() === 6) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    // Calculate intensity levels
    const values = Object.values(calendar).filter((v) => v > 0);
    const maxSubmissions = Math.max(...values, 1);

    const getIntensity = (count: number): number => {
      if (count === 0) return 0;
      const percentage = (count / maxSubmissions) * 100;
      if (percentage <= 25) return 1;
      if (percentage <= 50) return 2;
      if (percentage <= 75) return 3;
      return 4;
    };

    // Month labels
    const months: { name: string; span: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week) => {
      const firstDay = week[0];
      const month = firstDay.getMonth();
      if (month !== lastMonth) {
        months.push({
          name: firstDay.toLocaleDateString("en", { month: "short" }),
          span: 1,
        });
        lastMonth = month;
      } else if (months.length > 0) {
        months[months.length - 1].span++;
      }
    });

    return (
      <div className="heatmap">
        <div className="heatmap-months">
          <div className="heatmap-day-labels-spacer"></div>
          {months.map((month, i) => (
            <div
              key={i}
              className="heatmap-month"
              style={{ gridColumn: `span ${month.span}` }}
            >
              {month.name}
            </div>
          ))}
        </div>
        <div className="heatmap-grid-wrapper">
          <div className="heatmap-day-labels">
            <div className="heatmap-day-label">Mon</div>
            <div className="heatmap-day-label"></div>
            <div className="heatmap-day-label">Wed</div>
            <div className="heatmap-day-label"></div>
            <div className="heatmap-day-label">Fri</div>
            <div className="heatmap-day-label"></div>
            <div className="heatmap-day-label"></div>
          </div>
          <div className="heatmap-grid">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="heatmap-week">
                {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
                  const date = week[dayIdx];
                  if (!date || date > now || date < oneYearAgo) {
                    return <div key={dayIdx} className="heatmap-day empty"></div>;
                  }
                  const timestamp = Math.floor(date.getTime() / 1000).toString();
                  const count = calendar[timestamp] || 0;
                  const intensity = getIntensity(count);
                  const dateStr = date.toLocaleDateString("en", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  return (
                    <div
                      key={dayIdx}
                      className={`heatmap-day ${count > 0 ? "has-tooltip" : ""}`}
                      data-intensity={intensity}
                      data-tooltip={`${count} submission${count !== 1 ? "s" : ""} on ${dateStr}`}
                    ></div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="heatmap-legend">
          <span>Less</span>
          <div className="heatmap-day" data-intensity="0"></div>
          <div className="heatmap-day" data-intensity="1"></div>
          <div className="heatmap-day" data-intensity="2"></div>
          <div className="heatmap-day" data-intensity="3"></div>
          <div className="heatmap-day" data-intensity="4"></div>
          <span>More</span>
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <header className="header">
        <h1>LeetCode Dashboard</h1>
        <p>Track and compare progress across multiple users</p>
      </header>

      {users.length > 1 && (
        <section className="comparison-section">
          <h2>Comparison Table</h2>
          <div style={{ overflowX: "auto" }}>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Total Solved</th>
                  <th>Easy</th>
                  <th>Medium</th>
                  <th>Hard</th>
                  <th>Streak</th>
                  <th>Ranking</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.username}>
                    <td>
                      <div className="user-cell">
                        <img src={user.profile.avatar} alt={user.username} />
                        <a
                          href={`https://leetcode.com/${user.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {user.username}
                        </a>
                      </div>
                    </td>
                    <td
                      className={
                        findWinner("solvedProblem") === user.username
                          ? "winner total"
                          : "total"
                      }
                    >
                      {user.solved.solvedProblem}
                    </td>
                    <td
                      className={
                        findWinner("easySolved") === user.username
                          ? "winner easy"
                          : "easy"
                      }
                    >
                      {user.solved.easySolved}
                    </td>
                    <td
                      className={
                        findWinner("mediumSolved") === user.username
                          ? "winner medium"
                          : "medium"
                      }
                    >
                      {user.solved.mediumSolved}
                    </td>
                    <td
                      className={
                        findWinner("hardSolved") === user.username
                          ? "winner hard"
                          : "hard"
                      }
                    >
                      {user.solved.hardSolved}
                    </td>
                    <td>{user.calendar.streak} days</td>
                    <td>#{user.profile.ranking.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="heatmap-section">
        <h2>Submission Activity</h2>
        <div className="heatmap-toggle-buttons">
          {users.map((user) => (
            <button
              key={user.username}
              className={`heatmap-toggle ${selectedUser === user.username ? "active" : ""}`}
              onClick={() =>
                setSelectedUser(
                  selectedUser === user.username ? null : user.username
                )
              }
            >
              <img src={user.profile.avatar} alt={user.username} />
              <span>{user.username}</span>
            </button>
          ))}
        </div>
        {selectedUser ? (
          <div className="heatmap-container">
            {renderHeatmap(users.find((u) => u.username === selectedUser)!)}
          </div>
        ) : (
          <div className="heatmap-hint">
            Select a user above to view their submission activity
          </div>
        )}
      </section>

      <section className="users-grid">
        {users.map((user) => (
          <div key={user.username} className="user-card">
            <div className="user-card-header">
              <img src={user.profile.avatar} alt={user.username} />
              <div>
                <h3>
                  <a
                    href={`https://leetcode.com/${user.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {user.username}
                  </a>
                </h3>
                <p>
                  Rank:{" "}
                  <a
                    href={`https://leetcode.com/${user.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    #{user.profile.ranking.toLocaleString()}
                  </a>
                </p>
              </div>
            </div>

            <div className="stats-row">
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
              <div className="stat-box">
                <div className="number total">{user.solved.solvedProblem}</div>
                <div className="label">Total</div>
              </div>
            </div>

            <div className="progress-bars">
              {[
                {
                  label: "Easy",
                  solved: user.solved.easySolved,
                  total:
                    user.solved.totalSubmissionNum.find(
                      (s) => s.difficulty === "Easy"
                    )?.count || 0,
                  className: "easy",
                },
                {
                  label: "Medium",
                  solved: user.solved.mediumSolved,
                  total:
                    user.solved.totalSubmissionNum.find(
                      (s) => s.difficulty === "Medium"
                    )?.count || 0,
                  className: "medium",
                },
                {
                  label: "Hard",
                  solved: user.solved.hardSolved,
                  total:
                    user.solved.totalSubmissionNum.find(
                      (s) => s.difficulty === "Hard"
                    )?.count || 0,
                  className: "hard",
                },
              ].map((item) => {
                const percentage = item.total
                  ? (item.solved / item.total) * 100
                  : 0;
                return (
                  <div key={item.label} className="progress-item">
                    <div className="progress-label">
                      <span className={item.className}>{item.label}</span>
                      <span className={item.className}>
                        {item.solved}/{item.total}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className={`progress-fill ${item.className}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="activity-info">
              <div className="activity-badge">
                <span>🔥</span>
                <span>{user.calendar.streak} day streak</span>
              </div>
              <div className="activity-badge">
                <span>📅</span>
                <span>{user.calendar.totalActiveDays} active days</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      {users.length > 0 && (
        <section className="leaderboard">
          <h2>Leaderboard</h2>
          {sortedByTotal.map((user, index) => {
            const rankClass =
              index === 0 ? "gold" : index === 1 ? "silver" : index === 2 ? "bronze" : "";
            return (
              <div key={user.username} className="leaderboard-item">
                <div className={`leaderboard-rank ${rankClass}`}>
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                </div>
                <div className="leaderboard-user">
                  <img src={user.profile.avatar} alt={user.username} />
                  <a
                    href={`https://leetcode.com/${user.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {user.username}
                  </a>
                </div>
                <div className="leaderboard-stats">
                  <div className="count">{user.solved.solvedProblem}</div>
                  <div className="label">problems solved</div>
                </div>
              </div>
            );
          })}
        </section>
      )}

      <footer>
        <p>
          Data provided by{" "}
          <a
            href="https://github.com/alfaarghya/alfa-leetcode-api"
            target="_blank"
            rel="noopener noreferrer"
          >
            Alfa LeetCode API
          </a>
        </p>
      </footer>
    </div>
  );
}
