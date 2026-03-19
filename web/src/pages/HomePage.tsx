import { useState, useEffect, useCallback, useRef } from "react";
import { Browserbysector } from "./Browserbysector";
import Liveofeed from "../components/layout/Liveofeed";

const SLIDES = [
  {
    image:
      "https://images.unsplash.com/photo-1562601509-376518335492?q=80&w=2000",
    title: "Modern Metro Expansion",
    description:
      "Real Delhi Metro under-construction progress and site monitoring.",
    tag: "Mass Transit",
  },
  {
    image:
      "https://images.unsplash.com/photo-1581094271901-8022df4466f9?q=80&w=2000",
    category: "Bridge Engineering",
    title: "Signature Bridge Phase II",
    description:
      "Structural health monitoring of the pylon and high-tension cables.",
    tag: "Civil Works",
  },
  {
    image:
      "https://images.unsplash.com/photo-1545459720-aac273a27765?q=80&w=2000",
    title: "Central Vista Project",
    description:
      "Modernizing the administrative heart with sustainable urban drainage.",
    tag: "Urban Dev",
  },
];

export function HomePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStart = useRef(0);
  const touchEnd = useRef(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  }, []);

  const handleTouchStart = (e: React.TouchEvent) =>
    (touchStart.current = e.targetTouches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) =>
    (touchEnd.current = e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    const distance = touchStart.current - touchEnd.current;
    if (distance > 50) nextSlide();
    if (distance < -50)
      setCurrentIndex((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* 1. TOP SWIPER CARD */}
      <div
        className="mx-4 mt-6 h-[220px] relative rounded-[24px] overflow-hidden shadow-xl shadow-stone-200 group cursor-pointer"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={nextSlide}
      >
        <div
          className="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {SLIDES.map((slide, i) => (
            <div key={i} className="min-w-full h-full relative">
              <img
                src={slide.image}
                className="h-full w-full object-cover brightness-[0.7]"
                alt="Project"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <h2 className="text-white text-xl font-black uppercase leading-tight mb-1">
                  {slide.title}
                </h2>
                <p className="text-white/70 text-[10px] font-medium max-w-[80%] mb-3">
                  {slide.description}
                </p>
                <span className="w-fit px-3 py-1 bg-[#D97706] text-white rounded-full text-[9px] font-bold uppercase tracking-widest">
                  {slide.tag}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* PROGRESS DOTS (Exactly as per image) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 transition-all duration-300 rounded-full ${currentIndex === i ? "w-6 bg-orange-500" : "w-1.5 bg-white/40"}`}
            />
          ))}
        </div>
      </div>

      {/* 2. LIVE STATS BAR (The white icons bar under swiper) */}
      <div className="mx-4 mt-6 grid grid-cols-3 gap-2">
        <div className="bg-white p-3 rounded-2xl border border-stone-100 shadow-sm flex flex-col items-center">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">
            Active Tenders
          </span>
          <span className="text-lg font-black text-[#451a03]">1,240+</span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-100 shadow-sm flex flex-col items-center">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">
            Completed
          </span>
          <span className="text-lg font-black text-[#451a03]">450</span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-100 shadow-sm flex flex-col items-center">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">
            Total Value
          </span>
          <span className="text-lg font-black text-[#451a03]">₹12k CR</span>
        </div>
      </div>

      {/* Section Label */}
      <div className="px-6 mt-6">
        <Browserbysector />
      </div>
      <div>
        <Liveofeed />
      </div>
    </div>
  );
}
