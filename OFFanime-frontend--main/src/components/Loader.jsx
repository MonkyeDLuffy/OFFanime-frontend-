import { useEffect, useState } from "react";

export default function Loader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 22);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden">
      
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.08]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
            `,
            backgroundSize: "55px 55px",
          }}
        />
      </div>

      {/* Glow */}
      <div className="absolute w-[400px] h-[400px] bg-orange-500/10 blur-3xl rounded-full animate-pulse" />

      {/* Main Content */}
      <div className="relative flex flex-col items-center">
        
        {/* OF Logo */}
        <h1
          className="text-[170px] md:text-[220px] font-black leading-none tracking-[-10px] text-white"
          style={{
            textShadow: "0 0 40px rgba(255,140,0,0.25)",
          }}
        >
          OF
        </h1>

        {/* Tagline */}
        <p className="text-gray-400 tracking-[10px] text-xs md:text-sm uppercase -mt-3">
          THE UNFORGETTABLE EXPERIENCE
        </p>

        {/* Loading Line */}
        <div className="w-[260px] h-[1px] bg-zinc-800 mt-10 overflow-hidden rounded-full">
          <div
            className="h-full bg-orange-400 transition-all duration-200"
            style={{
              width: `${progress}%`,
              boxShadow: "0 0 10px rgba(255,140,0,0.8)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
