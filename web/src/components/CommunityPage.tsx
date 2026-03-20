import { 
  Plus, 
  Camera, 
  MapPin, 
  Image as ImageIcon, 
  ArrowUpRight, 
  HardHat, 
  Construction, 
  Droplets,
  Clock
} from "lucide-react";

export default function CommunityPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      
      {/* 1. Header: Community Branding */}
      <header className="space-y-1">
        <h1 className="text-3xl font-black text-[#451a03] tracking-tighter uppercase leading-none">
          Communities
        </h1>
        <p className="text-[11px] font-bold text-orange-600 uppercase tracking-[0.3em]">
          Verified Citizen Reports
        </p>
      </header>

      {/* 2. Quick Filters: Project Type */}
      <section>
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {['All Posts', 'Roads', 'Dams', 'Bridges', 'Buildings'].map((cat, i) => (
            <button key={i} className={`whitespace-nowrap rounded-2xl px-6 py-2.5 text-xs font-black transition-all active:scale-90 ${
              i === 0 
                ? 'bg-[#451a03] text-white shadow-xl shadow-orange-900/20' 
                : 'bg-white text-[#451a03] border border-black/5 hover:bg-orange-50'
            }`}>
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* 3. The "Latest Sightings" Hero Card */}
      <section>
        <div className="group relative overflow-hidden rounded-[40px] bg-[#451a03] p-8 text-white shadow-2xl">
          <div className="relative z-10 space-y-5">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 shadow-lg shadow-orange-500/40">
                <Camera size={12} className="text-white" strokeWidth={3} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">
                Newly Uploaded
              </span>
            </div>
            
            <div className="space-y-1">
              <h2 className="text-2xl font-black leading-tight tracking-tight">
                NH-44 Paving <br/> Started Today
              </h2>
              <div className="flex items-center gap-2 text-[10px] font-bold text-orange-100/40 uppercase tracking-widest">
                <MapPin size={10} /> Sector 4 Bypass
                <span className="mx-1">•</span>
                <Clock size={10} /> 12m ago
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md px-6 py-3 text-sm font-black text-white transition-all hover:bg-white/20 active:scale-95">
                View Photo <ImageIcon size={18} />
              </button>
              <div className="flex -space-x-2">
                <div className="h-9 w-9 rounded-full border-2 border-[#451a03] bg-orange-500 flex items-center justify-center text-[10px] font-black">
                  +15
                </div>
              </div>
            </div>
          </div>

          {/* Background Decorative Icon */}
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-orange-500/10 blur-[60px]" />
          <div className="absolute bottom-[-10px] right-[-10px] p-4 opacity-5 rotate-12">
             <ImageIcon size={160} strokeWidth={1} />
          </div>
        </div>
      </section>

      {/* 4. Infrastructure Community Hubs */}
      <section className="space-y-4">
        <h3 className="text-sm font-black text-[#451a03] uppercase tracking-widest opacity-40 px-1">
          Explore Projects
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
           <ProjectCard 
              title="Road Updates" 
              stats="2.4k Photos" 
              icon={<Construction size={22}/>} 
              color="bg-amber-600" 
           />
           <ProjectCard 
              title="Dam Progress" 
              stats="890 Photos" 
              icon={<Droplets size={22}/>} 
              color="bg-blue-600" 
           />
           <ProjectCard 
              title="Bridge Site" 
              stats="421 Photos" 
              icon={<HardHat size={22}/>} 
              color="bg-slate-700" 
           />
           <ProjectCard 
              title="Buildings" 
              stats="1.1k Photos" 
              icon={<ArrowUpRight size={22}/>} 
              color="bg-emerald-600" 
           />
        </div>
      </section>

      {/* 5. The Main Action: Upload Image from Camera */}
      <button className="fixed bottom-24 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-[24px] bg-[#E87B35] text-white shadow-2xl shadow-orange-900/40 active:scale-90 transition-all group">
        <Camera size={28} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
        <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#451a03] border-2 border-[#fff7f0]">
           <Plus size={14} strokeWidth={4} />
        </div>
      </button>
    </div>
  );
}

function ProjectCard({ title, stats, icon, color }: { title: string, stats: string, icon: any, color: string }) {
  return (
    <div className="flex flex-col gap-6 rounded-[32px] bg-white p-6 shadow-sm border border-black/[0.02] transition-all active:scale-95 hover:shadow-md group">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color} text-white shadow-lg shadow-black/10 group-hover:rotate-6 transition-transform`}>
        {icon}
      </div>
      <div>
        <h4 className="font-black text-[#451a03] tracking-tighter text-lg leading-none mb-2">{title}</h4>
        <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
           <ImageIcon size={10} /> {stats}
        </div>
      </div>
    </div>
  );
}