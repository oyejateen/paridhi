import { Link } from "react-router-dom";
import { MapPin, ChevronRight } from "lucide-react";

const DUMMY_DATA = [
  {
    id: 1,
    title: "NH-44 Flyover Expansion",
    location: "Delhi - NCR",
    status: "New Tender",
    progress: 15,
    budget: "₹450 Cr",
    color: "bg-orange-600",
  },
  {
    id: 2,
    title: "Smart City Phase II",
    location: "Gujarat, IN",
    status: "In Progress",
    progress: 65,
    budget: "₹120 Cr",
    color: "bg-green-600",
  },
  {
    id: 3,
    title: "Metro Line Extension",
    location: "South India",
    status: "Under Review",
    progress: 90,
    budget: "₹890 Cr",
    color: "bg-blue-600",
  },
];

export default function LiveUpdates() {
  return (
    <div className="px-6 space-y-4 mb-28">
      {DUMMY_DATA.map((item) => (
        <Link
          to={`/project/${item.id}`}
          key={item.id}
          className="block bg-white p-5 rounded-[24px] border border-stone-100 shadow-sm active:scale-[0.97] transition-all cursor-pointer"
        >
          {/* Top Row */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h4 className="text-[#451a03] text-[13px] font-black uppercase leading-tight">
                {item.title}
              </h4>
              <div className="flex items-center gap-1 mt-1 text-stone-400">
                <MapPin size={10} />
                <span className="text-[9px] font-bold uppercase tracking-wider">
                  {item.location}
                </span>
              </div>
            </div>

            <ChevronRight size={16} className="text-stone-300" />
          </div>

          {/* Progress Stats */}
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-black text-[#78350f]">
              {item.budget}
            </span>
            <span className="text-[10px] font-bold text-stone-400">
              {item.progress}% Complete
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${item.color} transition-all duration-700`}
              style={{ width: `${item.progress}%` }}
            />
          </div>
        </Link>
      ))}
    </div>
  );
}
