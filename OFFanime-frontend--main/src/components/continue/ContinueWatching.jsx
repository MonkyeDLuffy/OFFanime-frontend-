import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ContinueWatching() {
  const [data, setData] = useState([]);

  useEffect(() => {
    try {
      const stored =
        JSON.parse(localStorage.getItem("continueWatching")) || [];

      // newest first + limit 6
      const sorted = stored
        .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
        .slice(0, 6);

      setData(sorted);
    } catch (err) {
      console.error(err);
    }
  }, []);

  if (!data.length) return null;

  return (
    <div className="w-full mt-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-white text-3xl font-bold">
          Continue Watching
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
        {data.map((item, index) => (
          <Link
            key={index}
            to={`/watch/${item.id}?ep=${item.episode}`}
            className="group"
          >
            <div className="relative overflow-hidden rounded-xl bg-[#0c0c0f]">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-[260px] object-cover transition duration-300 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-90" />

              {/* progress */}
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white/10">
                <div
                  className="h-full bg-purple-500"
                  style={{
                    width: `${item.progress || 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-3">
              <h3 className="text-white text-sm md:text-base font-semibold line-clamp-1">
                {item.title}
              </h3>

              <p className="text-zinc-400 text-sm mt-1">
                Episode {item.episode}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
