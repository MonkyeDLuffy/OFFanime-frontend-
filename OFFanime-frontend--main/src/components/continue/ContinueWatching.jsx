import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createAnimeSlug } from "@/src/utils/slug.utils";

const ContinueWatching = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("continueWatching")) || [];
    setData(saved);
  }, []);

  if (!data.length) return null;

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-black mb-5">Continue Watching</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {data.map((item) => {
          const progress =
            item.duration > 0 ? (item.currentTime / item.duration) * 100 : 0;

          const slug = createAnimeSlug(item.title || item.name || "anime", item.id);

          return (
            <Link
              key={`${item.id}-${item.episode}`}
              to={`/watch/${slug}?ep=${item.episode || 1}`}
              className="group"
            >
              <div className="relative rounded-2xl overflow-hidden bg-[#111] border border-white/10 shadow-xl">
                <img
                  src={item.poster}
                  alt={item.title}
                  className="w-full h-[220px] object-cover group-hover:scale-105 transition duration-300"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                <div className="absolute bottom-0 left-0 w-full h-[5px] bg-white/10">
                  <div
                    className="h-full bg-white"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-xs text-gray-300">
                    Episode {item.episode || 1}
                  </p>
                </div>
              </div>

              <h3 className="text-sm font-bold mt-2 line-clamp-2 text-white group-hover:text-gray-300">
                {item.title || item.name}
              </h3>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default ContinueWatching;
