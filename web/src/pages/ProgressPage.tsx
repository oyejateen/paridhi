import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  Search,
  Lock,
  UserPlus,
  TrendingUp,
  ShieldCheck,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useExploration } from "../context/ExplorationContext";

// XP Formula
const calculateXP = (exploredCount: number): number => {
  return exploredCount * 50; // 50 XP per project
};

const calculateLevel = (xp: number): number => {
  return Math.floor(xp / 200) + 1; // Level up every 200 XP
};

const calculateNextLevelXP = (currentXP: number): number => {
  const currentLevel = calculateLevel(currentXP);
  return currentLevel * 200;
};

// Calculate current streak (days exploring consecutively)
const calculateStreak = () => {
  // Simulates a streak - in production, this would track daily exploration
  const seed = new Date().getTime();
  return Math.floor((seed % 100) / 3) + 1; // Random streak 1-33
};

// Civic Explorer Titles - Based on exploration milestones
interface Title {
  id: string;
  name: string;
  icon: string;
  minExplorations: number;
  description: string;
  color: string;
}

const TITLES: Title[] = [
  {
    id: "tourist",
    name: "Curious Tourist",
    icon: "🎒",
    minExplorations: 0,
    description: "Just started exploring",
    color: "from-blue-400 to-blue-600",
  },
  {
    id: "scout",
    name: "Civic Scout",
    icon: "🗺️",
    minExplorations: 3,
    description: "Explored 3+ projects",
    color: "from-green-400 to-green-600",
  },
  {
    id: "navigator",
    name: "Infrastructure Navigator",
    icon: "🧭",
    minExplorations: 8,
    description: "Mastered 8+ locations",
    color: "from-yellow-400 to-yellow-600",
  },
  {
    id: "architect",
    name: "Civic Architect",
    icon: "🏗️",
    minExplorations: 15,
    description: "Explored 15+ projects",
    color: "from-purple-400 to-purple-600",
  },
  {
    id: "guardian",
    name: "Infrastructure Guardian",
    icon: "🛡️",
    minExplorations: 25,
    description: "Protected 25+ projects",
    color: "from-red-400 to-red-600",
  },
  {
    id: "legend",
    name: "Paridhi Legend",
    icon: "👑",
    minExplorations: 40,
    description: "Explored 40+ projects",
    color: "from-orange-400 to-orange-600",
  },
];

// Achievement Badges
interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  required: number; // Projects needed
}

const BADGES: Badge[] = [
  {
    id: "explorer",
    name: "Explorer",
    emoji: "🗺️",
    description: "Explore 5 projects",
    required: 5,
  },
  {
    id: "adventurer",
    name: "Adventurer",
    emoji: "🚀",
    description: "Explore 15 projects",
    required: 15,
  },
  {
    id: "citizen",
    name: "Civic Champion",
    emoji: "🌟",
    description: "Explore 30 projects",
    required: 30,
  },
  {
    id: "legend",
    name: "Infrastructure Legend",
    emoji: "👑",
    description: "Explore 50 projects",
    required: 50,
  },
];

const TOP_STREAKS = [
  { rank: 1, name: "Aman Sharma", streak: 42, xp: 2400, level: 20 },
  { rank: 2, name: "Priya Singh", streak: 38, xp: 2150, level: 18 },
  { rank: 3, name: "Rahul V.", streak: 31, xp: 1900, level: 16 },
  { rank: 4, name: "Sneha Kapoor", streak: 28, xp: 1820, level: 15 },
  { rank: 5, name: "Vikram Das", streak: 25, xp: 1700, level: 14 },
  { rank: 6, name: "Anish Giri", streak: 22, xp: 1550, level: 13 },
  { rank: 7, name: "Meera K.", streak: 19, xp: 1400, level: 12 },
  { rank: 8, name: "Suresh P.", streak: 15, xp: 1200, level: 10 },
  { rank: 9, name: "Zain Khan", streak: 12, xp: 900, level: 8 },
  { rank: 10, name: "Ritu Raj", streak: 10, xp: 850, level: 7 },
];

// Calendar month generator for streak visualization
const getCalendarMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  const calendar = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendar.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendar.push(i);
  }
  return calendar;
};

// Check if day has exploration (simulated for frontend)
const isDayExplored = (day: number) => {
  if (!day) return false;
  // Simulate: 60% of days have exploration
  return Math.random() > 0.4;
};

export function ProgressPage() {
  const { user, loading } = useAuth();
  const { totalExplored } = useExploration();
  const [searchUser, setSearchUser] = React.useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const currentXP = useMemo(() => calculateXP(totalExplored), [totalExplored]);
  const currentLevel = useMemo(() => calculateLevel(currentXP), [currentXP]);
  const nextLevelXP = useMemo(() => calculateNextLevelXP(currentXP), [currentXP]);
  const progressPercentage = useMemo(
    () => ((currentXP % 200) / 200) * 100,
    [currentXP]
  );

  const earnedBadges = useMemo(
    () => BADGES.filter((badge) => totalExplored >= badge.required),
    [totalExplored]
  );

  const currentTitle = useMemo(
    () => [...TITLES].reverse().find((t) => totalExplored >= t.minExplorations) || TITLES[0],
    [totalExplored]
  );

  const streak = useMemo(() => calculateStreak(), []);
  const calendar = useMemo(() => getCalendarMonth(currentMonth), [currentMonth]);

  // 1. STATE: LOADING
  if (loading) {
    return (
      <div className="max-w-md mx-auto p-6 flex items-center justify-center min-h-screen">
        <p className="text-neutral-600">Loading progress...</p>
      </div>
    );
  }

  // 2. STATE: LOGGED OUT
  if (!user) {
    return (
      <div className="max-w-md mx-auto p-6 space-y-8 animate-in fade-in duration-700">
        <div className="text-center space-y-4 py-10">
          <div className="h-20 w-20 bg-orange-100 rounded-[30px] flex items-center justify-center mx-auto text-orange-600">
            <Lock size={40} strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-black text-[#451a03] uppercase tracking-tighter">
            Progress Locked
          </h2>
          <p className="text-stone-400 text-sm font-bold">
            Join the community to track your civic contributions and earn
            badges.
          </p>
          <Link
            to="/profile"
            className="w-full bg-[#451a03] text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-orange-900/20 active:scale-95 transition-all"
          >
            <UserPlus size={18} /> Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  // 3. STATE: NO ACTIVITY
  if (totalExplored === 0) {
    return (
      <div className="max-w-md mx-auto p-6 space-y-6 pb-24">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-[#451a03] uppercase tracking-tighter">
            Your Journey
          </h1>
          <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black flex items-center gap-1">
            <ShieldCheck size={12} /> VERIFIED
          </div>
        </header>

        <div className="bg-orange-50 border-2 border-orange-200 rounded-[32px] p-6 text-center space-y-4">
          <TrendingUp className="mx-auto text-orange-500" size={32} />
          <h3 className="font-black text-[#451a03] uppercase">
            No Activity Detected
          </h3>
          <p className="text-xs font-bold text-orange-800/60 leading-relaxed">
            Your progress bar is empty! Start by exploring nearby infrastructure projects to earn your first XP and badges.
          </p>
          <Link
            to="/explore"
            className="bg-orange-500 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all inline-block"
          >
            Start Exploring
          </Link>
        </div>

        <LeaderboardSection
          searchUser={searchUser}
          setSearchUser={setSearchUser}
          topStreaks={TOP_STREAKS}
        />
      </div>
    );
  }

  // 4. STATE: FULLY ACTIVE - DUOLINGO STYLE
  return (
    <div className="max-w-md mx-auto bg-[#fff7f0] min-h-screen pb-24 font-sans text-[#451a03]">
      {/* ===== 1. HEADER ===== */}
      <header className="bg-gradient-to-r from-orange-400 to-orange-500 px-6 pt-6 pb-8 rounded-b-[32px] text-white">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black uppercase tracking-tighter">Journey</h1>
          <div className="bg-white/30 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1">
            <ShieldCheck size={14} /> VERIFIED
          </div>
        </div>

        {/* Current Title / Rank */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center space-y-2">
          <p className="text-sm font-bold opacity-90">{currentTitle.icon} Your Current Title</p>
          <h2 className="text-2xl font-black uppercase tracking-tight">{currentTitle.name}</h2>
          <p className="text-xs font-bold opacity-75">{currentTitle.description}</p>
        </div>
      </header>

      {/* ===== 2. STREAK BANNER (Duolingo Style) ===== */}
      <div className="px-6 py-4 -mt-6 relative z-10">
        <div className="bg-white border-3 border-orange-300 rounded-[28px] p-5 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🔥</div>
            <div>
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">DAY STREAK</p>
              <p className="text-2xl font-black text-orange-600">{streak}</p>
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="text-2xl font-black text-[#451a03]">{currentLevel}</div>
            <p className="text-[8px] font-bold text-stone-400 uppercase">LEVEL</p>
          </div>
        </div>
      </div>

      <section className="px-6 py-6 space-y-6">
        {/* ===== 3. XP PROGRESS BAR ===== */}
        <div className="space-y-3">
          <div className="flex justify-between text-xs font-bold text-stone-600">
            <span className="flex items-center gap-1">
              <Zap size={14} className="text-orange-500" /> {currentXP} / {nextLevelXP} XP
            </span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-stone-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-400 to-orange-600 h-full rounded-full transition-all duration-500 shadow-lg shadow-orange-500/30"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-[9px] text-stone-500 text-center font-bold">
            {Math.round(progressPercentage) === 100 ? "🎉 LEVEL UP!" : `${200 - (currentXP % 200)} XP to next level`}
          </p>
        </div>

        {/* ===== 4. EXPLORATION CALENDAR ===== */}
        <div className="bg-white rounded-[28px] p-4 border-2 border-stone-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-[#451a03] uppercase tracking-widest">Exploration Calendar</h3>
              <p className="text-xs text-stone-400 font-bold">{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 hover:bg-stone-100 rounded-lg transition-all"
              >
                <ChevronLeft size={16} className="text-stone-400" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 hover:bg-stone-100 rounded-lg transition-all"
              >
                <ChevronRight size={16} className="text-stone-400" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-2">
            {/* Day labels */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div key={day} className="text-[10px] font-black text-stone-400 uppercase">{day}</div>
              ))}
            </div>
            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {calendar.map((day, idx) => {
                const isExploration = day ? isDayExplored(day) : false;
                const isToday = day === new Date().getDate() && 
                               currentMonth.getMonth() === new Date().getMonth() &&
                               currentMonth.getFullYear() === new Date().getFullYear();

                return (
                  <div
                    key={idx}
                    className={`aspect-square flex items-center justify-center rounded-lg text-xs font-black transition-all ${
                      !day
                        ? ''
                        : isExploration
                        ? isToday
                          ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/50 scale-105'
                          : 'bg-gradient-to-br from-emerald-300 to-emerald-500 text-white'
                        : isToday
                        ? 'border-3 border-orange-400 text-stone-400'
                        : 'bg-stone-100 text-stone-400'
                    }`}
                  >
                    {day && (isExploration ? '✓' : day)}
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-[9px] text-stone-500 mt-4 pt-3 border-t border-stone-100 text-center font-bold">
            📍 Green days = Project explored | 🔥 Maintain your streak!
          </p>
        </div>

        {/* ===== 5. CIVIC TITLES (Progression) ===== */}
        <div className="space-y-3">
          <h3 className="text-sm font-black text-[#451a03] uppercase tracking-widest">Civic Titles</h3>
          <div className="space-y-2">
            {TITLES.map((title) => {
              const earned = totalExplored >= title.minExplorations;
              return (
                <div
                  key={title.id}
                  className={`p-3 rounded-2xl transition-all border-2 ${
                    earned
                      ? `bg-gradient-to-r ${title.color} text-white border-2 border-transparent`
                      : 'bg-stone-100 border-stone-200 opacity-50 text-stone-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{title.icon}</span>
                      <div>
                        <p className="text-xs font-black uppercase tracking-tight">{title.name}</p>
                        <p className={`text-[9px] font-bold ${earned ? 'opacity-90' : ''}`}>{title.minExplorations}+ explorations</p>
                      </div>
                    </div>
                    {earned && <div className="text-xl">✨</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== 6. ACHIEVEMENT BADGES ===== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#451a03] uppercase tracking-widest">Achievements</h3>
            <span className="text-sm font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
              {earnedBadges.length}/{BADGES.length}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {BADGES.map((badge) => {
              const earned = totalExplored >= badge.required;
              return (
                <div
                  key={badge.id}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all transform ${
                    earned
                      ? 'bg-yellow-100 border-yellow-300 scale-105 shadow-lg shadow-yellow-300/30'
                      : 'bg-stone-100 border-stone-200 opacity-40'
                  }`}
                  title={badge.name}
                >
                  <div className="text-4xl mb-2 drop-shadow-lg">{badge.emoji}</div>
                  <p className="text-[8px] font-black text-stone-700 uppercase text-center leading-tight">{badge.required}+</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== 7. STATS OVERVIEW ===== */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-3 text-center space-y-1">
            <p className="text-3xl font-black text-blue-600">{totalExplored}</p>
            <p className="text-[9px] font-bold text-blue-700 uppercase tracking-widest">Projects</p>
          </div>
          <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-3 text-center space-y-1">
            <p className="text-3xl font-black text-purple-600">{currentXP}</p>
            <p className="text-[9px] font-bold text-purple-700 uppercase tracking-widest">Total XP</p>
          </div>
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-3 text-center space-y-1">
            <p className="text-3xl font-black text-emerald-600">{streak}</p>
            <p className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest">🔥 Streak</p>
          </div>
        </div>
      </section>

      {/* ===== 8. LEADERBOARD ===== */}
      <section className="px-6 pb-6">
        <LeaderboardSection
          searchUser={searchUser}
          setSearchUser={setSearchUser}
          topStreaks={TOP_STREAKS}
        />
      </section>
    </div>
  );
}

// Separate Component for the Leaderboard with Search
function LeaderboardSection({ searchUser, setSearchUser, topStreaks }: { searchUser: string; setSearchUser: (val: string) => void; topStreaks: any[] }) {
  const filteredUsers = topStreaks.filter((u: any) =>
    u.name.toLowerCase().includes(searchUser.toLowerCase()),
  );

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-[#451a03] uppercase tracking-widest">
          🏆 Streak Leaderboard
        </h3>
        <Trophy size={18} className="text-orange-500" />
      </div>

      {/* Search Bar for Users */}
      <div className="relative group">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#451a03]"
          size={16}
          strokeWidth={3}
        />
        <input
          type="text"
          placeholder="Find explorer..."
          className="w-full bg-white border-2 border-stone-100 rounded-2xl py-3 pl-12 pr-4 text-xs font-black placeholder:text-stone-300 outline-none focus:border-[#451a03] transition-all"
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
        />
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white border-2 border-stone-100 rounded-[28px] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gradient-to-r from-orange-50 to-yellow-50 text-[9px] font-black text-[#451a03] uppercase tracking-widest border-b-2 border-stone-100">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Explorer</th>
              <th className="px-4 py-3 text-right">🔥 Streak</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {filteredUsers.slice(0, 10).map((user: any) => (
              <tr
                key={user.rank}
                className="hover:bg-orange-50/50 transition-colors cursor-pointer"
              >
                <td className="px-4 py-4">
                  <span
                    className={`h-7 w-7 rounded-xl flex items-center justify-center text-[10px] font-black flex-wrap ${
                      user.rank === 1
                        ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg shadow-yellow-500/30"
                        : user.rank === 2
                        ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white"
                        : user.rank === 3
                        ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white"
                        : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {user.rank <= 3 ? ['🥇', '🥈', '🥉'][user.rank - 1] : user.rank}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <p className="text-xs font-black text-[#451a03] leading-none mb-1">
                    {user.name}
                  </p>
                  <p className="text-[8px] font-bold text-stone-400">
                    {user.xp} XP · Lvl {user.level}
                  </p>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 font-black text-orange-600 text-sm">
                    🔥 {user.streak}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-6 text-stone-400">
          <p className="text-sm font-bold">No explorers found</p>
        </div>
      )}
    </section>
  );
}
