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
    }, 20);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden">

      {/* Premium Grid */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Purple Glow */}
      <div className="absolute w-[500px] h-[500px] bg-purple-700/20 blur-[140px] rounded-full" />

      {/* Content */}
      <div className="relative flex flex-col items-center">

        {/* OF */}
        <h1
          className="text-[120px] md:text-[150px] font-black text-white leading-none tracking-[-8px]"
          style={{
            textShadow: "0 0 35px rgba(168,85,247,0.18)",
          }}
        >
          OF
        </h1>

        {/* Tagline */}
        <p className="mt-1 text-[10px] md:text-xs tracking-[8px] uppercase text-zinc-500">
          THE UNFORGETTABLE EXPERIENCE
        </p>

        {/* Loader */}
        <div className="w-[220px] h-[1px] bg-zinc-900 mt-8 overflow-hidden">
          <div
            className="h-full bg-purple-500 transition-all duration-200"
            style={{
              width: `${progress}%`,
              boxShadow: "0 0 12px rgba(168,85,247,0.9)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
