import { useState, useEffect, useCallback } from 'react';

const SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=1000",
    title: "Building Connections",
    description: "Track the progress of our city’s new arteries. From blueprint to blacktop.",
    progress: 85,
    tag: "Infrastructure"
  },
  {
    image: "https://images.unsplash.com/photo-1503387762-592dea58ef21?q=80&w=1000",
    title: "Spaces for the People",
    description: "Your taxes at work. Explore the new green lungs of our neighborhood.",
    progress: 42,
    tag: "Civic Space"
  },
  {
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000",
    title: "The Future is Local",
    description: "Construction on the new Innovation Center is 60% complete. See what's inside.",
    progress: 60,
    tag: "Digital Hub"
  },
  {
    image: "https://images.unsplash.com/photo-1504307651254-35680fb3ba66?q=80&w=1000",
    title: "Foundation of Progress",
    description: "Witness the transformation. Discuss the impact. Earn for your insights.",
    progress: 15,
    tag: "Development"
  }
];

export default function Homepageswipercontent() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  }, []);

  // Autoplay Logic
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="w-full h-[250px] relative rounded-[32px] overflow-hidden group shadow-2xl shadow-orange-900/10">
      {/* Slides Container */}
      <div 
        className="flex h-full w-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {SLIDES.map((slide, i) => (
          <div key={i} className="min-w-full h-full relative">
            {/* Image Layer */}
            <img 
              src={slide.image} 
              className="h-full w-full object-cover brightness-[0.6] saturate-[0.85]" 
              alt={slide.title}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

            {/* Content Layer */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 bg-orange-500/20 border border-orange-500/30 backdrop-blur-md rounded-lg text-[9px] font-black text-orange-400 uppercase tracking-widest">
                  {slide.tag}
                </span>
              </div>
              
              <h2 className="text-white text-2xl font-black uppercase tracking-tight leading-[0.9] mb-2">
                {slide.title}
              </h2>
              
              <p className="text-white/70 text-[11px] font-medium max-w-[280px] leading-relaxed mb-4">
                {slide.description}
              </p>
              
              {/* Progress Bar */}
              <div className="flex items-center gap-3">
                <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(249,115,22,0.4)]" 
                    style={{ width: `${slide.progress}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-white/90 tabular-nums">
                  {slide.progress}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Pagination Dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-1.5 transition-all duration-300 rounded-full ${
              currentIndex === i 
                ? "w-6 bg-orange-500" 
                : "w-1.5 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}