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
    }, 25);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden">
      
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Glow */}
      <div className="absolute w-[300px] h-[300px] bg-orange-500/20 blur-3xl rounded-full animate-pulse" />

      <div className="relative flex flex-col items-center">
        
        {/* Logo */}
        <div className="flex items-center gap-5">
          <h1 className="text-8xl font-black text-white tracking-widest animate-pulse">
            OF
          </h1>

          <div>
            <h2 className="text-5xl font-bold text-white">
              OFFANIME
            </h2>

            <p className="text-gray-400 tracking-[6px] text-sm mt-2">
              THE UNFORGETTABLE EXPERIENCE
            </p>
          </div>
        </div>

        {/* Loading Bar */}
        <div className="w-[300px] h-[2px] bg-zinc-800 mt-10 overflow-hidden rounded-full">
          <div
            className="h-full bg-orange-500 transition-all duration-200"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
