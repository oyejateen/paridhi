import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  Search,
  Flame,
  Lock,
  UserPlus,
  TrendingUp,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

// Dummy Data for the Leaderboard
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

export function ProgressPage() {
  // Mocking Auth States for UI Demonstration
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Change to true to see Inactive/Active states
  const [hasActivity, setHasActivity] = useState(false); // Change to true to see Active state
  const [searchUser, setSearchUser] = useState("");

  // 1. STATE: LOGGED OUT
  if (!isLoggedIn) {
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
          <button
            onClick={() => setIsLoggedIn(true)}
            className="w-full bg-[#451a03] text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-orange-900/20 active:scale-95 transition-all"
          >
            <UserPlus size={18} /> Login to Continue
          </button>
        </div>
      </div>
    );
  }

  // 2. STATE: LOGGED IN BUT INACTIVE
  if (isLoggedIn && !hasActivity) {
    return (
      <div className="max-w-md mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-[#451a03] uppercase tracking-tighter">
            Your Profile
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
            Your progress bar is empty! Start by searching for a project or
            uploading a site photo to earn your first 40 XP.
          </p>
          <button
            onClick={() => setHasActivity(true)}
            className="bg-orange-500 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all"
          >
            Explore Projects
          </button>
        </div>

        <LeaderboardSection
          searchUser={searchUser}
          setSearchUser={setSearchUser}
        />
      </div>
    );
  }

  // 3. STATE: FULLY ACTIVE
  return (
    <div className="max-w-md mx-auto p-6 space-y-8 pb-24">
      <header className="space-y-1">
        <h1 className="text-3xl font-black text-[#451a03] uppercase tracking-tighter">
          Civic Rank
        </h1>
        <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">
          Performance Dashboard
        </p>
      </header>

      {/* User Progress Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#451a03] p-4 rounded-2xl text-white text-center shadow-lg shadow-orange-900/20">
          <p className="text-[8px] font-bold text-orange-400 uppercase">
            Level
          </p>
          <p className="text-xl font-black">04</p>
        </div>
        <div className="bg-white border-2 border-stone-100 p-4 rounded-2xl text-center shadow-sm">
          <p className="text-[8px] font-bold text-stone-400 uppercase">XP</p>
          <p className="text-xl font-black text-[#451a03]">160</p>
        </div>
        <div className="bg-white border-2 border-stone-100 p-4 rounded-2xl text-center shadow-sm">
          <p className="text-[8px] font-bold text-stone-400 uppercase">
            Streak
          </p>
          <div className="flex items-center justify-center gap-1">
            <Flame size={16} className="text-orange-500" fill="currentColor" />
            <p className="text-xl font-black text-[#451a03]">02</p>
          </div>
        </div>
      </div>

      <LeaderboardSection
        searchUser={searchUser}
        setSearchUser={setSearchUser}
      />
    </div>
  );
}

// Separate Component for the Table and Search
function LeaderboardSection({ searchUser, setSearchUser }: any) {
  const filteredUsers = TOP_STREAKS.filter((u) =>
    u.name.toLowerCase().includes(searchUser.toLowerCase()),
  );

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-[#451a03] uppercase tracking-widest">
          Top Contributors
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
          placeholder="Find user progress..."
          className="w-full bg-white border-2 border-stone-100 rounded-2xl py-4 pl-12 pr-4 text-xs font-black placeholder:text-stone-300 outline-none focus:border-[#451a03] transition-all"
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
        />
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white border-2 border-stone-50 rounded-[32px] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-stone-50/50 text-[9px] font-black text-stone-400 uppercase tracking-widest">
            <tr>
              <th className="px-5 py-4">Rank</th>
              <th className="px-5 py-4">Name</th>
              <th className="px-5 py-4 text-right">Streak</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {filteredUsers.slice(0, 10).map((user) => (
              <tr
                key={user.rank}
                className="hover:bg-orange-50/30 transition-colors cursor-pointer"
              >
                <td className="px-5 py-4">
                  <span
                    className={`h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-black ${
                      user.rank === 1
                        ? "bg-orange-500 text-white"
                        : "bg-stone-100 text-stone-400"
                    }`}
                  >
                    {user.rank}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <p className="text-xs font-black text-[#451a03] leading-none mb-1">
                    {user.name}
                  </p>
                  <p className="text-[9px] font-bold text-stone-300">
                    Level {user.level} • {user.xp} XP
                  </p>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 font-black text-orange-600 text-xs">
                    <Flame size={12} fill="currentColor" />
                    {user.streak}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
