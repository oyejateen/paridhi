import LiveUpdates from "./LiveUpdates";

export default function Liveofeed() {
  return (
    <section className="mt-10">
      <div className="px-6 flex justify-between items-center mb-5">
        <div>
          <h3 className="text-[#451a03] text-[14px] font-black uppercase tracking-[0.12em]">
            Live Opportunities Feed
          </h3>
          <div className="h-1 w-12 bg-orange-500 rounded-full mt-1" />
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-stone-400 text-[9px] font-bold uppercase tracking-widest">
            Live Now
          </span>
        </div>
      </div>

      <LiveUpdates />
    </section>
  );
}
