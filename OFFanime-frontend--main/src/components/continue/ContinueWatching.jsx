import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function ContinueWatching() {
  const [data, setData] = useState([]);

  useEffect(() => {
    let alive = true;

    async function loadContinueWatching() {
      try {
        const stored =
          JSON.parse(localStorage.getItem("continueWatching")) || [];

        const sorted = stored
          .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
          .slice(0, 10);

        setData(sorted);

        const updated = await Promise.all(
          sorted.map(async (item) => {
            if (item.episodeImage) return item;

            try {
              const res = await fetch(`${API_URL}/tmdb/${item.id}`);
              const json = await res.json();

              const tmdbEpisodes = json?.data?.episodes || [];
              const ep = tmdbEpisodes.find(
                (x) => Number(x.episodeNumber) === Number(item.episode)
              );

              return {
                ...item,
                episodeImage:
                  ep?.image ||
                  item.image ||
                  item.poster ||
                  "",
              };
            } catch {
              return {
                ...item,
                episodeImage:
                  item.image ||
                  item.poster ||
                  "",
              };
            }
          })
        );

        if (!alive) return;

        setData(updated);

        const oldAll =
          JSON.parse(localStorage.getItem("continueWatching")) || [];

        const merged = oldAll.map((oldItem) => {
          const found = updated.find(
            (x) =>
              String(x.id) === String(oldItem.id) &&
              String(x.episode) === String(oldItem.episode)
          );

          return found || oldItem;
        });

        localStorage.setItem("continueWatching", JSON.stringify(merged));
      } catch (err) {
        console.error(err);
      }
    }

    loadContinueWatching();

    return () => {
      alive = false;
    };
  }, []);

  if (!data.length) return null;

  return (
    <div className="w-full mt-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-white text-3xl font-bold">
          Continue Watching
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
        {data.map((item, index) => {
          const image =
            item.episodeImage ||
            item.image ||
            item.poster ||
            "";

          return (
            <Link
              key={`${item.id}-${item.episode}-${index}`}
              to={`/watch/${item.slug || item.animeSlug || item.id}?ep=${item.episode}`}
              className="group"
            >
              <div className="relative h-[145px] rounded-xl overflow-hidden bg-[#111] border border-white/10">
                {image ? (
                  <img
                    src={image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-white/10 to-black" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center group-hover:bg-white group-hover:text-black transition">
                  ▶
                </div>

                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white/10">
                  <div
                    className="h-full bg-white"
                    style={{
                      width: `${item.progress || 8}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-3">
                <h3 className="text-white text-sm font-bold line-clamp-2">
                  {item.title}
                </h3>

                <p className="text-gray-400 text-sm mt-1">
                  Episode {item.episode}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
