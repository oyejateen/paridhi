import React, { useState } from "react";
import { Search, MapPin, Edit3, Globe, ChevronRight, X } from "lucide-react";

const INDIA_DATA: Record<string, string[]> = {
  Bihar: ["Lakhisarai", "Patna", "Gaya", "Begusarai", "Munger"],
  Delhi: ["New Delhi", "South Delhi", "North Delhi", "Dwarka"],
  Maharashtra: ["Mumbai", "Pune", "Thane", "Nagpur"],
  "Uttar Pradesh": ["Noida", "Lucknow", "Ghaziabad", "Kanpur"],
  Karnataka: ["Bangalore", "Mysore", "Hubli", "Mangalore"],
};

const PROJECTS = [
  {
    id: 1,
    name: "Kiul River Bridge",
    location: "Lakhisarai, Bihar",
    status: "Active",
    progress: 75,
  },
  {
    id: 2,
    name: "Outer Ring Road",
    location: "New Delhi, Delhi",
    status: "Delayed",
    progress: 40,
  },
  {
    id: 3,
    name: "Coastal Highway",
    location: "Mumbai, Maharashtra",
    status: "Active",
    progress: 15,
  },
  {
    id: 4,
    name: "Metro Extension",
    location: "Noida, UP",
    status: "Completed",
    progress: 100,
  },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");

  // Logic to determine if the user is currently searching
  const isSearching =
    query.length > 0 || state.length > 0 || district.length > 0;

  const filteredProjects = PROJECTS.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) &&
      (state === "" ||
        p.location.toLowerCase().includes(state.toLowerCase())) &&
      (district === "" ||
        p.location.toLowerCase().includes(district.toLowerCase())),
  );

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-24 font-sans text-[#451a03]">
      {/* 1. HEADER */}
      <header className="px-6 pt-10 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">
            Explore
          </h1>
          <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] mt-2">
            Verified Projects
          </p>
        </div>
        <div className="h-12 w-12 bg-[#451a03] rounded-2xl flex items-center justify-center shadow-lg shadow-orange-900/20">
          <Globe size={20} className="text-white" />
        </div>
      </header>

      {/* 2. SEARCH SECTION */}
      <section className="px-6 space-y-4">
        <div className="relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#451a03] group-focus-within:text-orange-500 transition-colors"
            size={22}
            strokeWidth={3}
          />
          <input
            type="text"
            placeholder="Search by project name..."
            className="w-full bg-white border-2 border-[#451a03]/10 rounded-2xl py-5 pl-14 pr-12 text-sm font-black placeholder:text-stone-400 outline-none focus:border-[#451a03] transition-all"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 hover:text-orange-600"
            >
              <X size={18} strokeWidth={3} />
            </button>
          )}
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1 group">
            <Edit3
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#451a03]/40 group-focus-within:text-orange-500"
              size={14}
              strokeWidth={3}
            />
            <input
              list="states-list"
              placeholder="STATE"
              className="w-full bg-stone-50 border-2 border-[#451a03]/5 rounded-xl py-3 pl-10 pr-3 text-[11px] font-black uppercase outline-none focus:border-[#451a03] transition-all"
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                setDistrict("");
              }}
            />
            <datalist id="states-list">
              {Object.keys(INDIA_DATA).map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          <div className="relative flex-1 group">
            <Edit3
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#451a03]/40 group-focus-within:text-orange-500"
              size={14}
              strokeWidth={3}
            />
            <input
              list="districts-list"
              placeholder="DISTRICT"
              className="w-full bg-stone-50 border-2 border-[#451a03]/5 rounded-xl py-3 pl-10 pr-3 text-[11px] font-black uppercase outline-none focus:border-[#451a03] transition-all"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />
            <datalist id="districts-list">
              {state &&
                INDIA_DATA[state] &&
                INDIA_DATA[state].map((d) => <option key={d} value={d} />)}
            </datalist>
          </div>
        </div>
      </section>

      {/* 3. DYNAMIC RESULTS AREA */}
      <section className="mt-10 px-4">
        <div className="flex items-center justify-between px-2 mb-4">
          {/* Logic: Change text based on search state */}
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
            {isSearching ? "Results Found" : "Asset Registry"}
          </h3>

          <span className="text-[10px] font-black text-[#451a03] bg-stone-100 px-2 py-1 rounded-md">
            {isSearching
              ? `${filteredProjects.length} Matches`
              : `${PROJECTS.length} Total Projects`}
          </span>
        </div>

        <div className="space-y-3">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              className="bg-white p-5 rounded-[32px] border-2 border-stone-100 shadow-sm flex items-center justify-between hover:border-[#451a03]/20 transition-all active:scale-95"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-[#451a03] rounded-xl flex items-center justify-center text-white text-[10px] font-black">
                  {p.id.toString().padStart(2, "0")}
                </div>
                <div>
                  <p className="font-black text-sm text-[#451a03] uppercase tracking-tight">
                    {p.name}
                  </p>
                  <div className="flex items-center gap-1 text-[9px] font-bold text-stone-400 uppercase mt-1">
                    <MapPin size={10} className="text-orange-600" />{" "}
                    {p.location}
                  </div>
                </div>
              </div>
              <ChevronRight size={18} className="text-stone-300" />
            </div>
          ))}

          {filteredProjects.length === 0 && (
            <div className="py-20 text-center bg-stone-50 rounded-[40px] border-2 border-dashed border-stone-200">
              <p className="text-xs font-black text-stone-300 uppercase tracking-widest">
                No Projects Found
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setState("");
                  setDistrict("");
                }}
                className="mt-4 text-[10px] font-black text-orange-600 uppercase border-b-2 border-orange-600"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
