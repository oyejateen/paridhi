import {
  Navigation,
  Building2,
  Waves,
  HardHat,
  ArrowRight,
} from "lucide-react";

const SECTORS = [
  { id: 1, name: "Roadways", icon: <Navigation size={24} strokeWidth={1.5} /> },
  { id: 2, name: "Buildings", icon: <Building2 size={24} strokeWidth={1.5} /> },
  { id: 3, name: "Dams", icon: <Waves size={24} strokeWidth={1.5} /> },
  { id: 4, name: "Bridges", icon: <HardHat size={24} strokeWidth={1.5} /> },
];

export function Browserbysector() {
  return (
    <section className="px-6 mt-10">
      {/* Header */}
      <div className="flex justify-between items-end mb-5">
        <div>
          <h3 className="text-[#451a03] text-[14px] font-black uppercase tracking-[0.12em]">
            Browse by Sector
          </h3>
          <div className="h-1 w-8 bg-orange-500 rounded-full mt-1" />
        </div>

        <button className="flex items-center gap-1 text-orange-600 text-[10px] font-black uppercase tracking-widest hover:gap-2 transition-all">
          View All <ArrowRight size={12} strokeWidth={3} />
        </button>
      </div>

      {/* 4-Column Icon Grid */}
      <div className="grid grid-cols-4 gap-4">
        {SECTORS.map((sector) => (
          <div
            key={sector.id}
            className="flex flex-col items-center gap-2.5 group cursor-pointer"
          >
            {/* Icon Container (Squircle) */}
            <div className="w-16 h-16 bg-white border border-stone-100 rounded-[24px] flex items-center justify-center text-stone-600 shadow-sm shadow-stone-100 group-active:scale-95 group-hover:border-orange-200 group-hover:bg-orange-50/50 transition-all duration-300">
              <div className="group-hover:text-orange-600 group-hover:rotate-6 transition-transform duration-300">
                {sector.icon}
              </div>
            </div>

            {/* Label */}
            <span className="text-[#78350f] text-[10px] font-black uppercase tracking-tight text-center leading-none">
              {sector.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
