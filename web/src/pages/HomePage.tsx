import { useState, useEffect, useRef } from "react";
import CommunityPage from "../components/CommunityPage";
import { Timer, MapPin, ChevronRight } from "lucide-react";

const SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1562601509-376518335492?q=80&w=2000",
    title: "Modern Metro Expansion",
    description: "Phase 4 tunneling progress and structural monitoring.",
    tag: "Mass Transit",
    status: "85% Complete",
    location: "New Delhi"
  },
  {
    image: "https://images.unsplash.com/photo-1581094271901-8022df4466f9?q=80&w=2000",
    title: "Signature Bridge Phase II",
    description: "Cabling and load testing of the secondary pylon.",
    tag: "Civil Works",
    status: "On Track",
    location: "Wazirabad"
  },
  {
    image: "https://images.unsplash.com/photo-1545459720-aac273a27765?q=80&w=2000",
    title: "Central Vista Project",
    description: "Sustainable drainage and landscape modernization.",
    tag: "Urban Dev",
    status: "92% Complete",
    location: "Kartavya Path"
  },
];

export function HomePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const touchStart = useRef(0);
  const touchEnd = useRef(0);

  // Handle auto-progress animation
  useEffect(() => {
    const duration = 5000; // 5 seconds per slide
    const interval = 50; // Update every 50ms
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Advance to next slide when progress completes
          setCurrentIndex((idx) => (idx === SLIDES.length - 1 ? 0 : idx + 1));
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-md mx-auto bg-[#fff7f0] min-h-screen pb-20">
      
      {/* 1. ANIMATED PROJECT SLIDER */}
      <div 
        className="mx-4 mt-6 h-[260px] relative rounded-[32px] overflow-hidden shadow-2xl shadow-orange-900/10 group bg-[#451a03]"
        onTouchStart={(e) => touchStart.current = e.targetTouches[0].clientX}
        onTouchMove={(e) => touchEnd.current = e.targetTouches[0].clientX}
        onTouchEnd={() => {
          if (touchStart.current - touchEnd.current > 50) {
            setCurrentIndex((idx) => (idx === SLIDES.length - 1 ? 0 : idx + 1));
            setProgress(0);
          }
          if (touchStart.current - touchEnd.current < -50) {
            setCurrentIndex((idx) => (idx === 0 ? SLIDES.length - 1 : idx - 1));
            setProgress(0);
          }
        }}
      >
        {SLIDES.map((slide, i) => (
          <div 
            key={i} 
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${currentIndex === i ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          >
            {/* Ken Burns Effect (Slow Zoom) */}
            <img
              src={slide.image}
              className={`h-full w-full object-cover brightness-[0.6] transition-transform duration-[5000ms] ease-linear ${currentIndex === i ? "scale-110" : "scale-100"}`}
              alt="Project"
            />
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#451a03] via-[#451a03]/20 to-transparent" />

            {/* Content Animation */}
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
              <div className={`transform transition-all duration-700 delay-300 ${currentIndex === i ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-orange-500 text-white rounded-md text-[8px] font-black uppercase tracking-widest">
                    {slide.tag}
                  </span>
                  <span className="flex items-center gap-1 text-white/50 text-[9px] font-bold uppercase">
                    <MapPin size={10} /> {slide.location}
                  </span>
                </div>
                
                <h2 className="text-white text-2xl font-black uppercase leading-none tracking-tighter mb-2">
                  {slide.title}
                </h2>
                
                <p className="text-white/60 text-[11px] font-medium leading-relaxed mb-4 line-clamp-2">
                  {slide.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-orange-400">
                    <Timer size={14} strokeWidth={3} />
                    <span className="text-[10px] font-black uppercase">{slide.status}</span>
                  </div>
                  <button className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* RECTANGLE PROGRESS INDICATORS (Like Instagram Stories) */}
        <div className="absolute top-4 left-6 right-6 z-20 flex gap-2">
          {SLIDES.map((_, i) => (
            <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-orange-500 transition-all ease-linear`}
                style={{ 
                    width: currentIndex === i ? `${progress}%` : currentIndex > i ? '100%' : '0%' 
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 2. LIVE STATS BAR */}
      <div className="mx-4 mt-6 grid grid-cols-3 gap-3">
        {[
          { label: "Active Sites", value: "1,240", icon: "🏗️" },
          { label: "Delivered", value: "450", icon: "✅" },
          { label: "Budget Used", value: "₹12k Cr", icon: "💰" }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-3xl border border-orange-100 shadow-sm flex flex-col items-center text-center">
            <span className="text-[18px] mb-1">{stat.icon}</span>
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-tighter leading-tight mb-1">
              {stat.label}
            </span>
            <span className="text-sm font-black text-[#451a03]">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* 3. COMMUNITY FEED */}
      <div className="px-6 mt-10">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-[#451a03] uppercase tracking-tighter">Project Feed</h3>
            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase">Live Updates</span>
        </div>
        <CommunityPage />
      </div>
    </div>
  );
}